import type { DiagnosisStep, TreatmentStep } from '@/types/fish-health'

type Step = DiagnosisStep | TreatmentStep

interface Props {
  steps: Step[]
}

function hasTool(step: Step): step is DiagnosisStep {
  return 'tool' in step && !!step.tool
}

export default function NumberedSteps({ steps }: Props) {
  if (!steps.length) return null

  return (
    <ol className="steps-list">
      {steps.map((step, i) => (
        <li key={i} className="step-item">
          <div className="step-num" aria-hidden="true">{step.step ?? i + 1}</div>
          <div className="step-body">
            <div className="step-action">{step.action}</div>
            <p className="step-detail">{step.detail}</p>
            {hasTool(step) && (
              <div className="step-tool">Recommended: {step.tool}</div>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
