export type GetOtpRequest = {
  phone_number: string
}

export type ApiEnvelope<TData> = {
  statusCode: number
  error: boolean
  data: TData
  message: string
}

export type GetOtpResponseData = {
  newuser: boolean
  phone_number: string
}

export type GetOtpResponse = ApiEnvelope<GetOtpResponseData>

export type ValidateOtpRequest = {
  phone_number: string
  otp: string
}

export type ValidateOtpResponseData = {
  token: string
  userinfo: {
    name: string
    designation: string
    state: string
    district: string
    block: string
    role: string
  }
}

export type ValidateOtpResponse = ApiEnvelope<ValidateOtpResponseData>

// DataInsights
export type DataInsightsRequest = {
  state_id: string
  district_id?: string
  block_id?: string
  session: string
}

export type LeadingIndicator = {
  id: string
  diseCode: string
  name: string
  trainedTeachers: number | string
  lessonsPerMonthPerDevice: number | string
  usageInMinutesPerDay: number | string
  lastSyncDays: number
  lastSyncDate?: string
  teacherAcceptance?: number | string
  activeSchools?: number | string
  smartSchools?: number | string
}

export type DataInsightsResponse = ApiEnvelope<{
  lastUpdatedDate: string
  dataMonth: number
  leadingIndicatorsGreenCriteria: {
    trainedTeachers: number
    lessonsPerMonthPerDevice: number
    usageInMinutesPerDay: number
    lastSyncDays: number
  }
  leadingIndicators: LeadingIndicator[]
  leadingIndicatorsLowUsage: Array<Record<string, any>>
  stateData: Record<string, any>
  districtData: Record<string, any>
}>

// District-wise Leading Indicators (GET) types
export type DWTeacherFeedback = {
  rating: number
  overall_feedback: number
}

export type DWContinuousAssessment = {
  childrenAssessed: number
  childrenAboveAverage: string
}

export type DWLeadingIndicator = {
  id: string
  name: string
  smartSchools: string
  usage_per_school: string
  stvUtilization: string
  usage_in_minutes_per_day: string
  trainedTeachers: string
  trainedTeachersPerSchool: number
  teacherFeedback: DWTeacherFeedback
  continuousAssessment: DWContinuousAssessment
}

export type DWDistrictWiseResponse = {
  statusCode: number
  error: string | null
  data: {
    lastUpdatedDate: string
    laggingIndicatorSubjects: string[]
    laggingIndicators2024: Array<Record<string, any>>
    leadingIndicators: DWLeadingIndicator[]
    leadingIndicatorsGreenCriteria: {
      usage_per_school: number
      stvUtilization: number
      usage_in_minutes_per_day: number
      teacherFeedback: number
      childrenAboveAverage: string
    }
    stateData: Record<string, any>
  }
  message: string
}


