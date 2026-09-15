import { en } from "./locales/en";
import { hindi } from "./locales/hindi";
import { bengali } from "./locales/bengali";
import { telugu } from "./locales/telugu";
import { marathi } from "./locales/marathi";
import { tamil } from "./locales/tamil";
import { gujarati } from "./locales/gujarati";
import { urdu } from "./locales/urdu";
import { kannada } from "./locales/kannada";
import { odia } from "./locales/odia";
import { malayalam } from "./locales/malayalam";
import { punjabi } from "./locales/punjabi";
import { assamese } from "./locales/assamese";
import { maithili } from "./locales/maithili";
import { sanskrit } from "./locales/sanskrit";
import { konkani } from "./locales/konkani";
import { manipuri } from "./locales/manipuri";
import { kashmiri } from "./locales/kashmiri";
import { nepali } from "./locales/nepali";
import { sindhi } from "./locales/sindhi";
import { dogri } from "./locales/dogri";
import { santali } from "./locales/santali";

export type Language = 'English' | 'Hindi' | 'Bengali' | 'Telugu' | 'Marathi' | 'Tamil' | 'Gujarati' | 'Urdu' | 'Kannada' | 'Odia' | 'Malayalam' | 'Punjabi' | 'Assamese' | 'Maithili' | 'Sanskrit' | 'Konkani' | 'Manipuri' | 'Kashmiri' | 'Nepali' | 'Sindhi' | 'Dogri' | 'Santali';

export interface Translations {
  settings: {
    title: string;
    profile: string;
    farmerName: string;
    farmInfo: string;
    editProfile: string;
    language: string;
    notifications: string;
    fieldEvents: string;
    recommendations: string;
    deviceAlerts: string;
    cropAndField: string;
    climateZone: string;
    season: string;
    growthStage: string;
    sowingDate: string;
    adaptiveBaseline: string;
    learningStatus: string;
    baselineConfidence: string;
    reviewSchedule: string;
    baselineExplanation: string;
    device: string;
    esp32Status: string;
    lastCommunication: string;
    sensorStatus: string;
    aiAssistant: string;
    askMarudamStatus: string;
    configStatus: string;
    aiNotConfigured: string;
    aboutMarudam: string;
    version: string;
    purpose: string;
    save: string;
    saving: string;
    savedSuccessfully: string;
    saveFailed: string;
    notAvailable: string;
    waitingForEsp: string;
  };
  helpCenter: {
    title: string;
    gettingStarted: string;
    howItWorks: string;
    readFieldHealth: string;
    howSensorsWork: string;
    sensors: string;
    soilMoisture: string;
    soilTemp: string;
    lightIntensity: string;
    airHumidity: string;
    surroundingTemp: string;
    fieldHealth: string;
    healthy: string;
    watch: string;
    attention: string;
    recommendations: string;
    whatRecommendationsMean: string;
    confidence: string;
    urgency: string;
    adaptiveBaseline: string;
    whatMarudamLearns: string;
    whyBaselineChanges: string;
    whyWeatherAffects: string;
    esp32: string;
    howToConnect: string;
    deviceOffline: string;
    askMarudam: string;
    howToAsk: string;
    supportedLanguages: string;
  };
  brand: {
  };
  landing: {
    titlePart1: string;
    titlePart2: string;
    subtitle: string;
    explorePlatform: string;
    builtForIndianFarmers: string;
    realTimeAI: string;
    smartIrrigation: string;
  };
  nav: {
    sidebarFarm: string;
    stage: string;
    device: string;
    home: string;
    about: string;
    features: string;
    login: string;
    register: string;
    dashboard: string;
    logout: string;
    myProfile: string;
    farm: string;
    sensors: string;
    aiInsights: string;
    alerts: string;
    history: string;
    helpCenter: string;
    settings: string;
  };
  login: {
    welcome: string;
    subtitle: string;
    email: string;
    password: string;
    forgotPassword: string;
    signIn: string;
    signingIn: string;
    noAccount: string;
    createAccount: string;
    backToHome: string;
    errorInvalidCredentials: string;
    errorGeneral: string;
    errorEmailRequired: string;
    errorPasswordRequired: string;
  };
  register: {
    title: string;
    subtitle: string;
    step1Title: string;
    step2Title: string;
    step3Title: string;
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    confirmPassword: string;
    confirmPasswordPlaceholder: string;
    language: string;
    state: string;
    district: string;
    selectState: string;
    selectDistrict: string;
    crop: string;
    selectCrop: string;
    sowingDate: string;
    deviceId: string;
    deviceIdPlaceholder: string;
    deviceIdOptional: string;
    next: string;
    back: string;
    createAccount: string;
    creatingAccount: string;
    alreadyHaveAccount: string;
    signIn: string;
    errorNameRequired: string;
    errorEmailInvalid: string;
    errorPasswordShort: string;
    errorPasswordMatch: string;
    errorStateRequired: string;
    errorDistrictRequired: string;
    errorCropRequired: string;
    successMessage: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    farmerProfile: string;
    farmerName: string;
    language: string;
    state: string;
    district: string;
    crop: string;
    sowingDate: string;
    saveProfile: string;
    profileSaved: string;
    agriculturalContext: string;
    climateZone: string;
    estimatedSeason: string;
    growthStage: string;
    regionalConditions: string;
    regionalNote: string;
    fieldLearningActive: string;
    adaptiveBaseline: string;
    adaptiveBaselineDesc: string;
    observations: string;
    confidence: string;
    confidenceLow: string;
    confidenceMedium: string;
    confidenceHigh: string;
    liveFieldConditions: string;
    withinRange: string;
    belowRange: string;
    aboveRange: string;
    waitingForEsp: string;
    noSensorData: string;
    fieldEvents: string;
    noEventsDetected: string;
    severity: string;
    duration: string;
    moreDetails: string;
    hideDetails: string;
    logout: string;
    fieldStatus: string;
    fieldStatusNormal: string;
    fieldStatusWatch: string;
    fieldStatusAttention: string;
    fieldStatusUncertain: string;
    recommendationTitle: string;
    evidenceSuggestsTitle: string;
    recommendationAction: string;
    confidence_label: string;
    deviceStatus: string;
    deviceOnline: string;
    deviceStale: string;
    deviceOffline: string;
    deviceUnknown: string;
    weatherTitle: string;
    rainProbability: string;
    rainUnlikely: string;
    rainLikely: string;
    rainMaybeWait: string;
    weatherUnavailable: string;
    weatherSimulation: string;
    temperature: string;
    rootZoneTitle: string;
    rootZoneMoistureLabel: string;
    rootZoneLow: string;
    rootZoneNormal: string;
    rootZoneHigh: string;
    rootZoneUnknown: string;
    rootZoneEstimatedNote: string;
    sensorSoilMoisture: string;
    sensorSoilTemperature: string;
    sensorAirHumidity: string;
    sensorSurroundingTemp: string;
    sensorLight: string;
    sensorUsual: string;
    sensorCurrent: string;
    fieldLearning: string;
    fieldLearningDesc: string;
    learningPeriodDays: string;
    nextReview: string;
    learningReason: string;
    todayFieldStatus: string;
    whatShouldIDo: string;
    why: string;
    fieldConditions: string;
    welcomeMorning: string;
    welcomeAfternoon: string;
    welcomeEvening: string;
    monitoringMsg: string;
    navDashboard: string;
    navField: string;
    navSensors: string;
    navInsights: string;
    plantedLabel: string;
    notSet: string;
    fieldHealthTitle: string;
    fieldHealthNormalDesc: string;
    fieldHealthWatchDesc: string;
    fieldHealthAttentionDesc: string;
    recommendationTitleUpper: string;
    reason: string;
    awaitingData: string;
    liveSensorsTitle: string;
    updatedLabel: string;
    waitingEsp32Title: string;
    waitingEsp32Desc: string;
    expLabel: string;
    statusLow: string;
    statusHigh: string;
    statusOptimal: string;
    learningUpper: string;
    learningDescLong: string;
    readingsCount: string;
    rangeLabel: string;
    initialLearningActive: string;
    weatherContextTitle: string;
    howThisAffectsYou: string;
    weatherHighRainDesc: string;
    weatherLowRainDesc: string;
    rootZoneUpperTitle: string;
    rootZoneLowDesc: string;
    rootZoneHighDesc: string;
    rootZoneNormalDesc: string;
    aiEstimated: string;
    waitingRootZone: string;
    fieldEventsUpper: string;
    noUnusualEvents: string;
    durationMins: string;
    severityLabel: string;
    sensorDetailsTitle: string;
    sensorDetailsDesc: string;
    fieldOverview: string;
    aiRecommendation: string;
    aiAdaptiveBaseline: string;
    learningProgress: string;
    calculatingAdaptiveBaseline: string;
    unknown: string;
  };
  recommendation: {
    MONITOR: string;
    CONSIDER_IRRIGATION: string;
    WAIT_FOR_RAIN: string;
    CHECK_FIELD: string;
    REDUCE_WATER: string;
  };
  evidence: {
    MOISTURE_DROP_PERSISTENT: string;
    MOISTURE_DROP_RECENT: string;
    MOISTURE_BELOW_BASELINE: string;
    MOISTURE_ABOVE_BASELINE: string;
    ROOT_ZONE_MOISTURE_LOW: string;
    HIGH_SURROUNDING_TEMPERATURE: string;
    LOW_AIR_HUMIDITY: string;
    HIGH_RAIN_PROBABILITY: string;
    LOW_RAIN_PROBABILITY: string;
    DELAY_IRRIGATION_RAIN_EXPECTED: string;
    WEATHER_UNAVAILABLE: string;
    BASELINE_CONFIDENCE_LOW: string;
    NO_SENSOR_DATA: string;
    AWAITING_BASELINE: string;
  };
  events: {
    NEW: string;
    ONGOING: string;
    PERSISTENT: string;
    RESOLVED: string;
    SOIL_MOISTURE_DROP: string;
    SOIL_MOISTURE_SURGE: string;
    TEMPERATURE_SPIKE: string;
    HUMIDITY_DROP: string;
  };
  risk: {
    NONE: string;
    WATER_DEFICIT: string;
    WATERLOGGING: string;
    HEAT_STRESS: string;
    LOW_LIGHT: string;
    label: string;
    levelLow: string;
    levelModerate: string;
    levelHigh: string;
  };
  chat: {
    title: string;
    askButton: string;
    placeholder: string;
    usingFieldData: string;
    thinking: string;
    send: string;
    close: string;
    suggestedTitle: string;
    suggested1: string;
    suggested2: string;
    suggested3: string;
    suggested4: string;
    suggested5: string;
    suggested6: string;
    errorNotConfigured: string;
    errorGeneral: string;
    emptyState: string;
  };
  baseline: {
    scheduleTitle: string;
    learning: string;
    learningComplete: string;
    daysRemaining: string;
    nextReviewDate: string;
    reasonStable: string;
    reasonModerate: string;
    reasonHighVariability: string;
    reasonNewCrop: string;
    reviewDue: string;
    versionLabel: string;
  };
  onboarding: {
    noDevice: string;
    noDeviceDesc: string;
    deviceConnected: string;
    setupComplete: string;
    welcomeFarmer: string;
  };
  common: {
    loading: string;
    error: string;
    retry: string;
    save: string;
    saved: string;
    cancel: string;
    confirm: string;
    days: string;
    hours: string;
    minutes: string;
    percent: string;
    celsius: string;
    lux: string;
    notAvailable: string;
    ago: string;
    justNow: string;
    today: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  'English': en,
  'Hindi': hindi,
  'Bengali': bengali,
  'Telugu': telugu,
  'Marathi': marathi,
  'Tamil': tamil,
  'Gujarati': gujarati,
  'Urdu': urdu,
  'Kannada': kannada,
  'Odia': odia,
  'Malayalam': malayalam,
  'Punjabi': punjabi,
  'Assamese': assamese,
  'Maithili': maithili,
  'Sanskrit': sanskrit,
  'Konkani': konkani,
  'Manipuri': manipuri,
  'Kashmiri': kashmiri,
  'Nepali': nepali,
  'Sindhi': sindhi,
  'Dogri': dogri,
  'Santali': santali
};

export function getTranslations(language: Language): Translations {
  return TRANSLATIONS[language] ?? TRANSLATIONS.English;
}

export function formatConfidence(value: number | undefined, code: string, language: Language): string {
  const t = getTranslations(language);
  const baseText = t.evidence[code as keyof typeof t.evidence];
  if (!baseText) return code;
  if (value !== undefined && !isNaN(value)) {
    return `${baseText} (${value.toFixed(1)}%)`;
  }
  return baseText;
}

export function translateEvent(code: string, language: Language): string {
  const t = getTranslations(language);
  return t.events[code as keyof typeof t.events] ?? code;
}

export function translateRecommendation(action: string, language: Language): string {
  const t = getTranslations(language);
  return t.recommendation[action as keyof typeof t.recommendation] ?? action;
}

export function translateEvidence(code: string, language: Language, value?: number): string {
  const t = getTranslations(language);
  const baseText = t.evidence[code as keyof typeof t.evidence];
  if (!baseText) return code;
  if (value !== undefined && !isNaN(value)) {
    return `${baseText} (${value})`;
  }
  return baseText;
}