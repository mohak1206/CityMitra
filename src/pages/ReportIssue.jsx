import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Upload, MapPin, Send } from 'lucide-react'
import { localDB } from '../services/localStorage'
import { POINTS_PER_ACTION, BADGES, getLevel } from '../utils/userUtils'
import { analyzeImageWithGemma } from '../services/gemmaService'
import StepUpload from '../components/report/StepUpload'
import StepLocation from '../components/report/StepLocation'
import StepAnalysis from '../components/report/StepAnalysis'
import StepConfirm from '../components/report/StepConfirm'
import StepProgress from '../components/ui/StepProgress'
import { Button, Card } from '../components/ui'

// Mock auth - replace with actual auth later
const getCurrentUser = () => {
  return localDB.getCurrentUser() || {
    uid: 'anonymous_' + Date.now(),
    email: 'anonymous@local.com',
    displayName: 'Anonymous User',
    photoURL: null
  }
}

export default function ReportIssue() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [reportData, setReportData] = useState({
    image: null,
    imagePreview: null,
    analysisResult: null,
    description: '',
    issueType: null,
    location: null,
    imageUrl: null,
  })
  const [analyzing, setAnalyzing] = useState(false)

  const updateReportData = (data) => {
    setReportData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const user = getCurrentUser()
  const [submitting, setSubmitting] = useState(false)

  // Analyze image using Ollama through n8n or direct
  const analyzeImage = async (imageBase64) => {
    setAnalyzing(true)
    try {
      // Use Gemma4B for real AI analysis
      return await analyzeImageWithGemma(imageBase64)
    } catch (error) {
      console.error('Gemma4B analysis error:', error)
      return {
        issueType: 'other',
        description: 'AI analysis failed. Please describe the issue manually.',
        severity: 'medium',
        estimatedRepairTime: '2-3 days'
      }
    } finally {
      setAnalyzing(false)
    }
  }

  const updateUserPoints = async (userId, userEmail, issueType) => {
    if (!userId || userId.startsWith('anonymous')) return

    const userData = {
      displayName: user?.displayName || userEmail?.split('@')[0] || 'Anonymous',
      email: userEmail,
      photoURL: user?.photoURL || null,
      issueType: issueType // Pass issue type for tracking
    }

    await localDB.updateUserPoints(userId, userData, POINTS_PER_ACTION.REPORT_SUBMITTED)
  }

  const handleSubmit = async () => {
    if (!reportData.imageUrl || !validationCheck(reportData)) return

    setSubmitting(true)
    try {
      // Create issue object
      const issueData = {
        imageUrl: reportData.imageUrl,
        description: reportData.description || 'No description provided',
        manualLabel: reportData.issueType || 'Unspecified',
        location: reportData.location || {},
        status: 'open',
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || 'anonymous',
        aiAnalysis: {
          detectedLabels: reportData.analysisResult?.objects || [],
          summary: reportData.analysisResult?.description || '',
          verified: reportData.analysisResult?.confidence > 0.7,
          confidenceScore: reportData.analysisResult?.confidence || 0,
          suggestedPriority: reportData.analysisResult?.severity || 'medium'
        }
      }

      // Save to local storage
      const savedIssue = await localDB.addIssue(issueData)

      // Update user points
      await updateUserPoints(user?.uid, user?.email, reportData.issueType || 'other')

      // Create notification
      localDB.addNotification({
        userId: user?.uid || 'anonymous',
        type: 'success',
        title: 'Report Submitted',
        message: `Your ${reportData.issueType || 'issue'} report has been submitted successfully!`,
        data: { issueId: savedIssue.id }
      })

      alert('✅ Report submitted successfully! You earned 10 Impact Points.')
      navigate('/dashboard')
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Failed to submit report. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const validationCheck = (data) => {
    return data.imageUrl && data.location?.lat && data.location?.lng
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepUpload
            reportData={reportData}
            updateReportData={updateReportData}
            onNext={nextStep}
            onAnalyze={analyzeImage}
            analyzing={analyzing}
          />
        )
      case 2:
        return (
          <StepAnalysis
            reportData={reportData}
            updateReportData={updateReportData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )
      case 3:
        return (
          <StepLocation
            reportData={reportData}
            updateReportData={updateReportData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )
      case 4:
        return (
          <StepConfirm
            reportData={reportData}
            updateReportData={updateReportData}
            onSubmit={handleSubmit}
            isSubmitting={submitting}
            onBack={prevStep}
          />
        )
      default:
        return null
    }
  }

  const stepHints = [
    '📸 Upload an image of the issue (pothole, graffiti, broken light, etc.)',
    '🤖 AI will analyze your image using local Ollama (gemma4:e4b)',
    '📍 Mark the exact location so city officials can find it',
    '✅ Review and submit your report to help improve your city'
  ]

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-cream">
      {/* Blueprint grid background */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(#3B7DD8 1px, transparent 1px),
            linear-gradient(90deg, #3B7DD8 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-4xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="inline-block font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">
            Civic Reporting
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-slate mb-3 tracking-tight">
            Report an Issue
          </h1>
          <p className="text-slate-muted font-body text-lg">
            Help improve your city by reporting infrastructure problems
          </p>
          <p className="text-sm text-slate-muted mt-2">
            🔒 Local storage mode - No Firebase required
          </p>
        </motion.div>

        {/* Enhanced Step Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <StepProgress currentStep={currentStep} />
          <motion.p 
            key={currentStep}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-slate-muted font-body text-sm mt-6 max-w-md mx-auto"
          >
            {stepHints[currentStep - 1]}
          </motion.p>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
