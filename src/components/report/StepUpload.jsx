import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Camera,
  Image,
  X,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Button, Card } from "../ui";
import { MapPin } from "lucide-react";
import { getCurrentLocation } from "../../utils/locationUtils";

// Compress image before storing
const compressImage = (base64String, maxWidth = 1200) => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || typeof window.Image === "undefined") {
      reject(new Error("Image compression is only supported in the browser."));
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      // Compress to JPEG with 0.8 quality
      const compressed = canvas.toDataURL("image/jpeg", 0.8);
      resolve(compressed);
    };
    img.onerror = (err) => reject(err);
    img.src = base64String;
  });
};

export default function StepUpload({
  reportData,
  updateReportData,
  onNext,
  onAnalyze,
  analyzing,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileSelect = useCallback(
    async (file) => {
      if (!file || !file.type.startsWith("image/")) {
        setUploadError("Please select a valid image file");
        return;
      }

      setUploadError(null);
      setIsUploading(true);
      setIsLocating(true);

      // Start location capture in parallel
      const locationPromise = getCurrentLocation().catch((err) => {
        console.warn("Auto-location failed:", err);
        return null;
      });

      try {
        // Read file as base64
        const reader = new FileReader();
        reader.onload = async (e) => {
          const originalBase64 = e.target.result;

          // Compress image
          const compressedBase64 = await compressImage(originalBase64);

          console.log("Image processed successfully (local storage mode)");

          updateReportData({
            image: file,
            imagePreview: compressedBase64,
            imageUrl: compressedBase64, // Store base64 directly
            storagePath: `local_${Date.now()}_${file.name}`,
            bucket: "local-storage",
          });

          // Run AI analysis if onAnalyze provided
          if (onAnalyze) {
            try {
              const analysisResult = await onAnalyze(compressedBase64);
              updateReportData({
                analysisResult,
                issueType: analysisResult?.issueType || "other",
                description: analysisResult?.description || "",
              });
            } catch (err) {
              console.warn("AI analysis failed:", err);
            }
          }

          setIsUploading(false);

          // Handle location result
          const location = await locationPromise;
          setIsLocating(false);

          if (location) {
            console.log("Auto-captured location:", location);
            updateReportData({
              location: {
                lat: location.lat,
                lng: location.lng,
                address: location.address,
              },
            });
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Upload error:", error);
        setUploadError(`Upload failed: ${error.message}`);
        setIsUploading(false);
      }
    },
    [updateReportData, onAnalyze],
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const removeImage = () => {
    updateReportData({
      image: null,
      imagePreview: null,
    });
  };

  return (
    <div className="space-y-6">
      <Card hover={false} className="p-8">
        <h2 className="font-display text-xl font-semibold text-slate mb-2">
          Capture or Upload Image
        </h2>
        <p className="text-slate-muted font-body mb-6">
          Take a photo or upload an image of the city issue you want to report.
          Our AI will analyze it to verify the issue type.
        </p>

        {reportData.imagePreview ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <img
              src={reportData.imagePreview}
              alt="Issue preview"
              className="w-full h-80 object-cover border border-cream-muted"
            />
            <button
              onClick={removeImage}
              className="absolute top-3 right-3 p-2 bg-cream/80 backdrop-blur-sm text-slate hover:bg-danger hover:text-cream transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              relative border-2 border-dashed p-12 text-center
              transition-all duration-300 cursor-pointer
              ${
                isDragging
                  ? "border-blueprint bg-blueprint/5"
                  : "border-cream-muted hover:border-blueprint/50 hover:bg-cream-dark/30"
              }
            `}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="flex flex-col items-center">
              <motion.div
                animate={{ y: isDragging ? -10 : 0 }}
                className="w-20 h-20 bg-blueprint/10 flex items-center justify-center mb-6"
              >
                <Upload className="w-10 h-10 text-blueprint" />
              </motion.div>

              <p className="font-display text-lg font-medium text-slate mb-2">
                {isDragging
                  ? "Drop your image here"
                  : "Drag and drop your image"}
              </p>
              <p className="text-slate-muted font-body mb-4">
                or click to browse
              </p>

              <div className="flex items-center gap-2 text-sm text-slate-muted font-body">
                <Image className="w-4 h-4" />
                <span>Supports JPG, PNG, HEIC up to 10MB</span>
              </div>
            </div>
          </div>
        )}

        {/* Mobile camera option */}
        <div className="mt-6 flex flex-col gap-3">
          {uploadError && (
            <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/30">
              <AlertCircle className="w-5 h-5 text-danger shrink-0" />
              <p className="text-sm text-danger font-body">{uploadError}</p>
            </div>
          )}

          {isUploading && (
            <div className="flex items-center gap-2 p-3 bg-blueprint/10 border border-blueprint/30">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4"
              >
                <Upload className="w-4 h-4 text-blueprint" />
              </motion.div>
              <p className="text-sm text-blueprint font-body">
                Uploading image...
              </p>
            </div>
          )}

          {/* Location Status */}
          {(isLocating || reportData.location) && (
            <div
              className={`flex items-center gap-2 p-3 border ${reportData.location ? "bg-success/10 border-success/30" : "bg-blueprint/10 border-blueprint/30"}`}
            >
              <MapPin
                className={`w-5 h-5 ${reportData.location ? "text-success" : "text-blueprint"}`}
              />
              <div className="flex-1">
                <p
                  className={`text-sm font-display font-medium ${reportData.location ? "text-success" : "text-blueprint"}`}
                >
                  {isLocating ? "Detecting location..." : "Location captured"}
                </p>
                {reportData.location?.address && (
                  <p className="text-xs text-slate-muted font-body truncate max-w-[250px]">
                    {reportData.location.address}
                  </p>
                )}
              </div>
            </div>
          )}

          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleInputChange}
              disabled={isUploading}
              className="hidden"
            />
            <div
              className={`flex items-center justify-center gap-2 px-4 py-4 border border-cream-muted hover:border-blueprint/50 transition-colors min-h-[44px] ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Camera className="w-5 h-5 text-blueprint" />
              <span className="text-slate font-display font-medium">
                Take Photo
              </span>
            </div>
          </label>

          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />
            <div className="flex items-center justify-center gap-2 px-4 py-4 border border-cream-muted hover:border-accent/50 transition-colors min-h-[44px]">
              <Upload className="w-5 h-5 text-accent" />
              <span className="text-slate font-display font-medium">
                Upload File
              </span>
            </div>
          </label>
        </div>
      </Card>

      {/* Next Button */}
      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!reportData.imageUrl || isUploading}
          icon={ArrowRight}
          iconPosition="right"
          size="lg"
        >
          Continue to Analysis
        </Button>
      </div>
    </div>
  );
}
