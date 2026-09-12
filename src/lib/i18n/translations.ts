// =============================================================================
// Marudam — Deterministic Multilingual Translations
// =============================================================================
// All display strings are deterministically mapped from structured backend codes.
// The underlying decision data (field_status, risk_type, etc.) is NEVER altered.
// Only this presentation layer changes per language.
// Crop names / season names / growth stage names are handled in db.ts.
// =============================================================================

export type Language = 'English' | 'Hindi' | 'Tamil' | 'Telugu' | 'Kannada';

export interface Translations {
  // ── Brand ──────────────────────────────────────────────────────────────────
  brand: {
    name: string;
    tagline: string;
  };

  // ── Nav ────────────────────────────────────────────────────────────────────
  nav: {
    home: string;
    about: string;
    features: string;
    login: string;
    register: string;
    dashboard: string;
    logout: string;
    myProfile: string;
  };

  // ── Auth: Login ─────────────────────────────────────────────────────────────
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

  // ── Auth: Register ──────────────────────────────────────────────────────────
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

  // ── Dashboard ───────────────────────────────────────────────────────────────
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
    // Field Status
    fieldStatus: string;
    fieldStatusNormal: string;
    fieldStatusWatch: string;
    fieldStatusAttention: string;
    fieldStatusUncertain: string;
    // Recommendation
    recommendationTitle: string;
    evidenceSuggestsTitle: string;
    recommendationAction: string;
    confidence_label: string;
    // Device
    deviceStatus: string;
    deviceOnline: string;
    deviceStale: string;
    deviceOffline: string;
    deviceUnknown: string;
    // Weather
    weatherTitle: string;
    rainProbability: string;
    rainUnlikely: string;
    rainLikely: string;
    rainMaybeWait: string;
    weatherUnavailable: string;
    weatherSimulation: string;
    temperature: string;
    // Root Zone
    rootZoneTitle: string;
    rootZoneMoistureLabel: string;
    rootZoneLow: string;
    rootZoneNormal: string;
    rootZoneHigh: string;
    rootZoneUnknown: string;
    rootZoneEstimatedNote: string;
    // Sensor Labels
    sensorSoilMoisture: string;
    sensorSoilTemperature: string;
    sensorAirHumidity: string;
    sensorSurroundingTemp: string;
    sensorLight: string;
    sensorUsual: string;
    sensorCurrent: string;
    // Baseline Learning
    fieldLearning: string;
    fieldLearningDesc: string;
    learningPeriodDays: string;
    nextReview: string;
    learningReason: string;
    // Today summary
        // --- Redesign Strings ---
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
    todayFieldStatus: string;
    whatShouldIDo: string;
    why: string;
    fieldConditions: string;
  };

  // ── Recommendations (farmer-friendly sentences) ─────────────────────────────

  recommendation: {
    MONITOR: string;
    CONSIDER_IRRIGATION: string;
    WAIT_FOR_RAIN: string;
    CHECK_FIELD: string;
    REDUCE_WATER: string;
  };

  // ── Evidence Explanations ───────────────────────────────────────────────────
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

  // ── Event status labels ─────────────────────────────────────────────────────
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

  // ── Risk labels ──────────────────────────────────────────────────────────────
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

  // ── Chatbot ──────────────────────────────────────────────────────────────────
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

  // ── Baseline Scheduling ──────────────────────────────────────────────────────
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

  // ── Onboarding ───────────────────────────────────────────────────────────────
  onboarding: {
    noDevice: string;
    noDeviceDesc: string;
    deviceConnected: string;
    setupComplete: string;
    welcomeFarmer: string;
  };

  // ── Common ───────────────────────────────────────────────────────────────────
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
}

// =============================================================================
// ENGLISH
// =============================================================================
const en: Translations = {

  settings: {
    title: 'Settings',
    profile: 'Profile', farmerName: 'Farmer Name', farmInfo: 'Farm Information', editProfile: 'Edit Profile',
    language: 'Language',
    notifications: 'Notifications', fieldEvents: 'Field Event Notifications', recommendations: 'Recommendation Notifications', deviceAlerts: 'Device Alerts',
    cropAndField: 'Crop & Field', climateZone: 'Climate Zone', season: 'Season', growthStage: 'Growth Stage', sowingDate: 'Sowing Date',
    adaptiveBaseline: 'Adaptive Baseline', learningStatus: 'Learning Status', baselineConfidence: 'Baseline Confidence', reviewSchedule: 'Review Schedule', baselineExplanation: 'Marudam continuously learns your field\'s normal conditions.',
    device: 'Device', esp32Status: 'ESP32 Connection Status', lastCommunication: 'Last Communication', sensorStatus: 'Sensor Connection Status',
    aiAssistant: 'AI Assistant', askMarudamStatus: 'Ask Marudam Status', configStatus: 'Configuration Status', aiNotConfigured: 'AI assistant is not configured yet.',
    aboutMarudam: 'About Marudam', version: 'Version', purpose: 'Purpose',
    save: 'Save', saving: 'Saving...', savedSuccessfully: 'Saved successfully.', saveFailed: 'Save failed. Please try again.',
    notAvailable: 'Not available', waitingForEsp: 'Waiting for ESP32'
  },
  helpCenter: {
    title: 'Help Center',
    gettingStarted: 'Getting Started', howItWorks: 'How Marudam works', readFieldHealth: 'How to read field health', howSensorsWork: 'How sensors work',
    sensors: 'Sensors', soilMoisture: 'Soil moisture', soilTemp: 'Soil temperature', lightIntensity: 'Light intensity', airHumidity: 'Air humidity', surroundingTemp: 'Surrounding temperature',
    fieldHealth: 'Field Health', healthy: 'Healthy', watch: 'Watch', attention: 'Attention',
    recommendations: 'Recommendations', whatRecommendationsMean: 'What recommendations mean', confidence: 'Confidence', urgency: 'Urgency',
    adaptiveBaseline: 'Adaptive Baseline', whatMarudamLearns: 'What Marudam learns', whyBaselineChanges: 'Why baseline changes', whyWeatherAffects: 'Why weather affects baseline learning',
    esp32: 'ESP32', howToConnect: 'How to connect the device', deviceOffline: 'What happens when the device is offline',
    askMarudam: 'Ask Marudam', howToAsk: 'How to ask questions', supportedLanguages: 'Supported languages'
  },
  brand: { name: 'Marudam', tagline: 'Know your field. Grow with confidence.' },
  nav: {
    home: 'Home', about: 'About', features: 'Features',
    login: 'Sign In', register: 'Create Account',
    dashboard: 'Dashboard', logout: 'Sign Out', myProfile: 'My Profile',
  },
  login: {
    welcome: 'Welcome back',
    subtitle: 'Sign in to your farm dashboard',
    email: 'Email address', password: 'Password',
    forgotPassword: 'Forgot password?',
    signIn: 'Sign in', signingIn: 'Signing in…',
    noAccount: "Don't have an account?", createAccount: 'Create account',
    backToHome: 'Back', errorInvalidCredentials: 'Incorrect email or password.',
    errorGeneral: 'Sign in failed. Please try again.',
    errorEmailRequired: 'Email is required.', errorPasswordRequired: 'Password is required.',
  },
  register: {
    title: 'Create Farmer Account', subtitle: 'Set up your Marudam farm profile',
    step1Title: 'Account Details', step2Title: 'Your Location', step3Title: 'Your Crop',
    name: 'Your name', namePlaceholder: 'e.g. Ravi Kumar',
    email: 'Email address', emailPlaceholder: 'you@example.com',
    password: 'Password', passwordPlaceholder: 'At least 8 characters',
    confirmPassword: 'Confirm password', confirmPasswordPlaceholder: 'Re-enter password',
    language: 'Preferred language', state: 'State', district: 'District',
    selectState: 'Select state', selectDistrict: 'Select district',
    crop: 'Primary crop', selectCrop: 'Select crop',
    sowingDate: 'Sowing date', deviceId: 'Device ID', deviceIdPlaceholder: 'e.g. FIELD_001',
    deviceIdOptional: 'Optional — you can add this later',
    next: 'Next', back: 'Back', createAccount: 'Create Account', creatingAccount: 'Creating…',
    alreadyHaveAccount: 'Already have an account?', signIn: 'Sign in',
    errorNameRequired: 'Name is required.',
    errorEmailInvalid: 'Please enter a valid email address.',
    errorPasswordShort: 'Password must be at least 8 characters.',
    errorPasswordMatch: 'Passwords do not match.',
    errorStateRequired: 'Please select a state.',
    errorDistrictRequired: 'Please select a district.',
    errorCropRequired: 'Please select a crop.',
    successMessage: 'Account created! Redirecting to your dashboard…',
  },
  dashboard: {
    title: 'Marudam', subtitle: 'Your field, today',
    farmerProfile: 'Farmer Profile', farmerName: 'Farmer',
    language: 'Language', state: 'State', district: 'District',
    crop: 'Crop', sowingDate: 'Sowing Date',
    saveProfile: 'Save Profile', profileSaved: 'Saved!',
    agriculturalContext: 'Agricultural Context', climateZone: 'Climate Zone',
    estimatedSeason: 'Season', growthStage: 'Growth Stage',
    regionalConditions: 'Regional Conditions', regionalNote: 'Regional baseline',
    fieldLearningActive: 'Field Learning Active',
    adaptiveBaseline: 'Adaptive Baseline', adaptiveBaselineDesc: 'Marudam is learning your field',
    observations: 'Observations', confidence: 'Confidence',
    confidenceLow: 'Low', confidenceMedium: 'Building', confidenceHigh: 'Good',
    liveFieldConditions: 'Field Conditions', withinRange: 'Normal', belowRange: 'Below usual', aboveRange: 'Above usual',
    waitingForEsp: 'Waiting for sensor data…', noSensorData: 'No sensor data yet',
    fieldEvents: 'Field Events', noEventsDetected: 'No unusual events detected',
    severity: 'Severity', duration: 'Duration',
    moreDetails: 'More details', hideDetails: 'Hide details', logout: 'Sign Out',
    fieldStatus: 'Field Status',
    fieldStatusNormal: 'Normal', fieldStatusWatch: 'Watch', fieldStatusAttention: 'Attention', fieldStatusUncertain: 'Uncertain',
    recommendationTitle: 'What should I do?', evidenceSuggestsTitle: 'Why?', recommendationAction: 'Recommended action',
    confidence_label: 'Confidence',
    deviceStatus: 'Sensor Device', deviceOnline: 'Online', deviceStale: 'Stale', deviceOffline: 'Offline', deviceUnknown: 'Unknown',
    weatherTitle: 'Weather', rainProbability: 'Rain chance',
    rainUnlikely: 'Rain is unlikely today.', rainLikely: 'Rain is likely soon.',
    rainMaybeWait: 'Rain may come. Consider waiting before irrigating.',
    weatherUnavailable: 'Weather data unavailable.', weatherSimulation: 'Simulated weather',
    temperature: 'Temperature',
    rootZoneTitle: 'Root Zone', rootZoneMoistureLabel: 'Root moisture',
    rootZoneLow: 'Low', rootZoneNormal: 'Normal', rootZoneHigh: 'High', rootZoneUnknown: 'Unknown',
    rootZoneEstimatedNote: 'Estimated — not directly measured',
    sensorSoilMoisture: 'Soil Moisture', sensorSoilTemperature: 'Soil Temperature',
    sensorAirHumidity: 'Air Humidity', sensorSurroundingTemp: 'Surrounding Temp', sensorLight: 'Light',
    sensorUsual: 'Your field usually', sensorCurrent: 'Current',
    fieldLearning: 'Field Learning', fieldLearningDesc: 'Marudam is learning what is normal for your field.',
    learningPeriodDays: 'Learning period', nextReview: 'Next review', learningReason: 'Reason',
    todayFieldStatus: "Today's Field Status", whatShouldIDo: 'What should I do?', why: 'Why?', fieldConditions: 'Field Conditions',

    welcomeMorning: 'Good morning', welcomeAfternoon: 'Good afternoon', welcomeEvening: 'Good evening',
    monitoringMsg: 'Marudam is monitoring your {crop} field in {district}.',
    navDashboard: 'Dashboard', navField: 'Field', navSensors: 'Sensors', navInsights: 'Insights',
    plantedLabel: 'Planted', notSet: 'Not set',
    fieldHealthTitle: 'FIELD HEALTH',
    fieldHealthNormalDesc: 'Your field conditions are currently within the expected range.',
    fieldHealthWatchDesc: 'Some conditions are slightly outside the expected baseline. Monitor closely.',
    fieldHealthAttentionDesc: 'Immediate attention may be required. Conditions are outside safe bounds.',
    recommendationTitleUpper: 'MARUDAM RECOMMENDS', reason: 'Reason',
    awaitingData: 'Awaiting enough data for a recommendation.',
    liveSensorsTitle: 'Live Field Sensors', updatedLabel: 'Updated',
    waitingEsp32Title: 'Waiting for ESP32', waitingEsp32Desc: 'Your field device hasn\'t connected recently. Live sensor readings will appear here when the ESP32 comes online.',
    expLabel: 'Exp', statusLow: 'Low', statusHigh: 'High', statusOptimal: 'Optimal',
    learningUpper: 'MARUDAM IS LEARNING YOUR FIELD', learningDescLong: 'Marudam learns the normal conditions of your specific field over time and uses them to detect unusual changes accurately.',
    readingsCount: 'readings', rangeLabel: 'Range',
    initialLearningActive: 'Initial learning phase is active. Accurate baselines will appear soon.',
    weatherContextTitle: 'WEATHER CONTEXT', howThisAffectsYou: 'How this affects you',
    weatherHighRainDesc: 'High chance of rain. Delay irrigation if possible.', weatherLowRainDesc: 'Low chance of rain. Monitor soil moisture closely.',
    rootZoneUpperTitle: 'ROOT-ZONE CONDITION', rootZoneLowDesc: 'Sub-surface moisture is likely depleting. Deep irrigation may be needed.',
    rootZoneHighDesc: 'Sub-surface is saturated. Ensure proper drainage.', rootZoneNormalDesc: 'Root zone moisture appears adequate based on surface readings and weather.',
    aiEstimated: 'AI Estimated', waitingRootZone: 'Waiting for sufficient data to estimate root zone.',
    fieldEventsUpper: 'FIELD EVENTS', noUnusualEvents: 'No unusual events detected recently.',
    durationMins: 'm duration', severityLabel: 'Severity',
    sensorDetailsTitle: 'Sensor Details', sensorDetailsDesc: 'Historical readings and detailed trends will appear after Marudam collects more field data over a sustained period.',
  },

  recommendation: {
    MONITOR: 'Your field looks normal. Keep monitoring regularly.',
    CONSIDER_IRRIGATION: 'Your field is drier than usual and little rain is expected. Check the field and consider irrigation.',
    WAIT_FOR_RAIN: 'Your field is dry but rain is expected soon. Wait and check again after the rain.',
    CHECK_FIELD: 'Visit your field and check the soil condition directly.',
    REDUCE_WATER: 'Your field has more moisture than usual. Reduce irrigation for now.',
  },
  evidence: {
    MOISTURE_DROP_PERSISTENT: 'Soil moisture has remained below normal for an extended period.',
    MOISTURE_DROP_RECENT: 'Soil moisture has dropped below normal recently.',
    MOISTURE_BELOW_BASELINE: 'Soil moisture is below your field\'s usual range.',
    MOISTURE_ABOVE_BASELINE: 'Soil moisture is above your field\'s usual range.',
    ROOT_ZONE_MOISTURE_LOW: 'Root zone moisture is estimated to be low.',
    HIGH_SURROUNDING_TEMPERATURE: 'Surrounding temperature is high, which increases water loss.',
    LOW_AIR_HUMIDITY: 'Air humidity is low, which increases evaporation.',
    HIGH_RAIN_PROBABILITY: 'Rain is likely in the near future.',
    LOW_RAIN_PROBABILITY: 'Little rain is expected in the near future.',
    DELAY_IRRIGATION_RAIN_EXPECTED: 'Rain is expected soon — irrigation may not be needed yet.',
    WEATHER_UNAVAILABLE: 'Weather forecast data is not available.',
    BASELINE_CONFIDENCE_LOW: 'Marudam is still learning your field — the baseline is not yet reliable.',
    NO_SENSOR_DATA: 'No sensor data received yet.',
    AWAITING_BASELINE: 'Waiting to establish your field\'s baseline.',
  },
  events: {
    NEW: 'New', ONGOING: 'Ongoing', PERSISTENT: 'Persistent', RESOLVED: 'Resolved',
    SOIL_MOISTURE_DROP: 'Moisture drop', SOIL_MOISTURE_SURGE: 'Moisture surge',
    TEMPERATURE_SPIKE: 'Temperature spike', HUMIDITY_DROP: 'Humidity drop',
  },
  risk: {
    NONE: 'No risk detected', WATER_DEFICIT: 'Water deficit risk', WATERLOGGING: 'Waterlogging risk',
    HEAT_STRESS: 'Heat stress risk', LOW_LIGHT: 'Low light',
    label: 'Risk', levelLow: 'Low', levelModerate: 'Moderate', levelHigh: 'High',
  },
  chat: {
    title: 'Ask Marudam', askButton: 'Ask Marudam', placeholder: 'Ask about your field…',
    usingFieldData: 'Using your field data', thinking: 'Thinking…', send: 'Send', close: 'Close',
    suggestedTitle: 'You can ask:',
    suggested1: 'Why should I irrigate?',
    suggested2: 'Is rain expected today?',
    suggested3: 'Why is my field status showing Attention?',
    suggested4: 'What is different from normal in my field?',
    suggested5: 'How is Marudam learning my field?',
    suggested6: 'What does my soil moisture value mean?',
    errorNotConfigured: 'The AI assistant is not configured yet. Please set the OPENAI_API_KEY.',
    errorGeneral: 'Something went wrong. Please try again.',
    emptyState: 'Ask me anything about your field.',
  },
  baseline: {
    scheduleTitle: 'Field Learning Schedule',
    learning: 'Learning…', learningComplete: 'Learning complete',
    daysRemaining: 'days remaining', nextReviewDate: 'Next review',
    reasonStable: 'Conditions are stable — a shorter learning period may be sufficient.',
    reasonModerate: 'Conditions are moderately variable — using a standard learning period.',
    reasonHighVariability: 'Weather has been changing frequently — using a longer learning period to avoid learning a temporary condition as normal.',
    reasonNewCrop: 'New crop or growth stage — starting a fresh learning period.',
    reviewDue: 'A baseline review is recommended.',
    versionLabel: 'Baseline version',
  },
  onboarding: {
    noDevice: 'Sensor not connected', noDeviceDesc: 'Connect your ESP32 sensor device to start monitoring your field.',
    deviceConnected: 'Sensor connected', setupComplete: 'Setup complete',
    welcomeFarmer: 'Welcome to Marudam',
  },
  common: {
    loading: 'Loading…', error: 'Error', retry: 'Retry', save: 'Save', saved: 'Saved',
    cancel: 'Cancel', confirm: 'Confirm', days: 'days', hours: 'hours', minutes: 'minutes',
    percent: '%', celsius: '°C', lux: 'lux', notAvailable: 'N/A', ago: 'ago', justNow: 'just now', today: 'Today',
  },
};

// =============================================================================
// HINDI
// =============================================================================
const hi: Translations = {

  settings: {
    title: 'सेटिंग्स',
    profile: 'प्रोफ़ाइल', farmerName: 'किसान का नाम', farmInfo: 'खेत की जानकारी', editProfile: 'प्रोफ़ाइल संपादित करें',
    language: 'भाषा',
    notifications: 'सूचनाएं', fieldEvents: 'खेत की घटना की सूचनाएं', recommendations: 'सिफारिश की सूचनाएं', deviceAlerts: 'डिवाइस अलर्ट',
    cropAndField: 'फसल और खेत', climateZone: 'जलवायु क्षेत्र', season: 'मौसम', growthStage: 'विकास का चरण', sowingDate: 'बुवाई की तारीख',
    adaptiveBaseline: 'अनुकूली बेसलाइन', learningStatus: 'सीखने की स्थिति', baselineConfidence: 'बेसलाइन विश्वास', reviewSchedule: 'समीक्षा अनुसूची', baselineExplanation: 'मरुदम लगातार आपके खेत की सामान्य स्थितियों को सीखता है।',
    device: 'डिवाइस', esp32Status: 'ESP32 कनेक्शन स्थिति', lastCommunication: 'अंतिम संचार', sensorStatus: 'सेंसर कनेक्शन स्थिति',
    aiAssistant: 'AI सहायक', askMarudamStatus: 'मरुदम से पूछें स्थिति', configStatus: 'कॉन्फ़िगरेशन स्थिति', aiNotConfigured: 'AI सहायक अभी कॉन्फ़िगर नहीं किया गया है।',
    aboutMarudam: 'मरुदम के बारे में', version: 'संस्करण', purpose: 'उद्देश्य',
    save: 'सहेजें', saving: 'सहेजा जा रहा है...', savedSuccessfully: 'सफलतापूर्वक सहेजा गया।', saveFailed: 'सहेजना विफल रहा। कृपया पुनः प्रयास करें।',
    notAvailable: 'उपलब्ध नहीं है', waitingForEsp: 'ESP32 की प्रतीक्षा'
  },
  helpCenter: {
    title: 'सहायता केंद्र',
    gettingStarted: 'शुरुआत करना', howItWorks: 'मरुदम कैसे काम करता है', readFieldHealth: 'खेत का स्वास्थ्य कैसे पढ़ें', howSensorsWork: 'सेंसर कैसे काम करते हैं',
    sensors: 'सेंसर', soilMoisture: 'मिट्टी की नमी', soilTemp: 'मिट्टी का तापमान', lightIntensity: 'प्रकाश की तीव्रता', airHumidity: 'हवा की नमी', surroundingTemp: 'आसपास का तापमान',
    fieldHealth: 'खेत का स्वास्थ्य', healthy: 'स्वस्थ', watch: 'निगरानी', attention: 'ध्यान दें',
    recommendations: 'सिफारिशें', whatRecommendationsMean: 'सिफारिशों का क्या अर्थ है', confidence: 'विश्वास', urgency: 'तात्कालिकता',
    adaptiveBaseline: 'अनुकूली बेसलाइन', whatMarudamLearns: 'मरुदम क्या सीखता है', whyBaselineChanges: 'बेसलाइन क्यों बदलती है', whyWeatherAffects: 'मौसम बेसलाइन सीखने को क्यों प्रभावित करता है',
    esp32: 'ESP32', howToConnect: 'डिवाइस को कैसे कनेक्ट करें', deviceOffline: 'डिवाइस ऑफ़लाइन होने पर क्या होता है',
    askMarudam: 'मरुदम से पूछें', howToAsk: 'प्रश्न कैसे पूछें', supportedLanguages: 'समर्थित भाषाएँ'
  },
  brand: { name: 'मरुदम', tagline: 'अपने खेत को जानें। विश्वास से उगाएँ।' },
  nav: {
    home: 'होम', about: 'हमारे बारे में', features: 'विशेषताएँ',
    login: 'साइन इन', register: 'खाता बनाएँ',
    dashboard: 'डैशबोर्ड', logout: 'साइन आउट', myProfile: 'मेरी प्रोफ़ाइल',
  },
  login: {
    welcome: 'वापस स्वागत है', subtitle: 'अपने खेत के डैशबोर्ड में साइन इन करें',
    email: 'ईमेल पता', password: 'पासवर्ड',
    forgotPassword: 'पासवर्ड भूल गए?',
    signIn: 'साइन इन', signingIn: 'साइन इन हो रहा है…',
    noAccount: 'खाता नहीं है?', createAccount: 'खाता बनाएँ',
    backToHome: 'वापस', errorInvalidCredentials: 'ईमेल या पासवर्ड गलत है।',
    errorGeneral: 'साइन इन विफल रहा। कृपया पुनः प्रयास करें।',
    errorEmailRequired: 'ईमेल आवश्यक है।', errorPasswordRequired: 'पासवर्ड आवश्यक है।',
  },
  register: {
    title: 'किसान खाता बनाएँ', subtitle: 'अपनी मरुदम खेत प्रोफ़ाइल सेट करें',
    step1Title: 'खाता विवरण', step2Title: 'आपका स्थान', step3Title: 'आपकी फसल',
    name: 'आपका नाम', namePlaceholder: 'जैसे रवि कुमार',
    email: 'ईमेल पता', emailPlaceholder: 'you@example.com',
    password: 'पासवर्ड', passwordPlaceholder: 'कम से कम 8 अक्षर',
    confirmPassword: 'पासवर्ड की पुष्टि करें', confirmPasswordPlaceholder: 'पासवर्ड दोबारा दर्ज करें',
    language: 'पसंदीदा भाषा', state: 'राज्य', district: 'जिला',
    selectState: 'राज्य चुनें', selectDistrict: 'जिला चुनें',
    crop: 'मुख्य फसल', selectCrop: 'फसल चुनें',
    sowingDate: 'बुआई की तारीख', deviceId: 'डिवाइस आईडी', deviceIdPlaceholder: 'जैसे FIELD_001',
    deviceIdOptional: 'वैकल्पिक — बाद में जोड़ सकते हैं',
    next: 'आगे', back: 'वापस', createAccount: 'खाता बनाएँ', creatingAccount: 'बन रहा है…',
    alreadyHaveAccount: 'पहले से खाता है?', signIn: 'साइन इन',
    errorNameRequired: 'नाम आवश्यक है।', errorEmailInvalid: 'कृपया एक वैध ईमेल दर्ज करें।',
    errorPasswordShort: 'पासवर्ड कम से कम 8 अक्षर का होना चाहिए।',
    errorPasswordMatch: 'पासवर्ड मेल नहीं खाते।',
    errorStateRequired: 'कृपया राज्य चुनें।', errorDistrictRequired: 'कृपया जिला चुनें।',
    errorCropRequired: 'कृपया फसल चुनें।',
    successMessage: 'खाता बन गया! डैशबोर्ड पर जा रहे हैं…',
  },
  dashboard: {
    title: 'मरुदम', subtitle: 'आपका खेत, आज',
    farmerProfile: 'किसान प्रोफ़ाइल', farmerName: 'किसान',
    language: 'भाषा', state: 'राज्य', district: 'जिला',
    crop: 'फसल', sowingDate: 'बुआई की तारीख',
    saveProfile: 'प्रोफ़ाइल सहेजें', profileSaved: 'सहेजा!',
    agriculturalContext: 'कृषि संदर्भ', climateZone: 'जलवायु क्षेत्र',
    estimatedSeason: 'मौसम', growthStage: 'वृद्धि चरण',
    regionalConditions: 'क्षेत्रीय स्थिति', regionalNote: 'क्षेत्रीय आधार रेखा',
    fieldLearningActive: 'खेत सीख रहा है',
    adaptiveBaseline: 'अनुकूली आधार रेखा', adaptiveBaselineDesc: 'मरुदम आपके खेत को सीख रहा है',
    observations: 'अवलोकन', confidence: 'विश्वसनीयता',
    confidenceLow: 'कम', confidenceMedium: 'बन रही है', confidenceHigh: 'अच्छी',
    liveFieldConditions: 'खेत की स्थिति', withinRange: 'सामान्य', belowRange: 'सामान्य से कम', aboveRange: 'सामान्य से अधिक',
    waitingForEsp: 'सेंसर डेटा की प्रतीक्षा…', noSensorData: 'अभी तक कोई सेंसर डेटा नहीं',
    fieldEvents: 'खेत की घटनाएँ', noEventsDetected: 'कोई असामान्य घटना नहीं',
    severity: 'गंभीरता', duration: 'अवधि',
    moreDetails: 'अधिक विवरण', hideDetails: 'विवरण छुपाएँ', logout: 'साइन आउट',
    fieldStatus: 'खेत की स्थिति',
    fieldStatusNormal: 'सामान्य', fieldStatusWatch: 'ध्यान दें', fieldStatusAttention: 'सावधानी', fieldStatusUncertain: 'अनिश्चित',
    recommendationTitle: 'मुझे क्या करना चाहिए?', evidenceSuggestsTitle: 'क्यों?', recommendationAction: 'अनुशंसित कार्य',
    confidence_label: 'विश्वसनीयता',
    deviceStatus: 'सेंसर डिवाइस', deviceOnline: 'ऑनलाइन', deviceStale: 'पुराना', deviceOffline: 'ऑफलाइन', deviceUnknown: 'अज्ञात',
    weatherTitle: 'मौसम', rainProbability: 'बारिश की संभावना',
    rainUnlikely: 'आज बारिश की संभावना कम है।', rainLikely: 'जल्द बारिश हो सकती है।',
    rainMaybeWait: 'बारिश हो सकती है। सिंचाई से पहले प्रतीक्षा करें।',
    weatherUnavailable: 'मौसम डेटा उपलब्ध नहीं।', weatherSimulation: 'अनुमानित मौसम',
    temperature: 'तापमान',
    rootZoneTitle: 'जड़ क्षेत्र', rootZoneMoistureLabel: 'जड़ नमी',
    rootZoneLow: 'कम', rootZoneNormal: 'सामान्य', rootZoneHigh: 'अधिक', rootZoneUnknown: 'अज्ञात',
    rootZoneEstimatedNote: 'अनुमानित — प्रत्यक्ष माप नहीं',
    sensorSoilMoisture: 'मिट्टी की नमी', sensorSoilTemperature: 'मिट्टी का तापमान',
    sensorAirHumidity: 'वायु आर्द्रता', sensorSurroundingTemp: 'परिवेश तापमान', sensorLight: 'प्रकाश',
    sensorUsual: 'आपके खेत में सामान्यत:', sensorCurrent: 'वर्तमान',
    fieldLearning: 'खेत सीखना', fieldLearningDesc: 'मरुदम सीख रहा है कि आपके खेत में क्या सामान्य है।',
    learningPeriodDays: 'सीखने की अवधि', nextReview: 'अगली समीक्षा', learningReason: 'कारण',
    todayFieldStatus: 'आज खेत की स्थिति',
    welcomeMorning: 'सुप्रभात', welcomeAfternoon: 'शुभ दोपहर', welcomeEvening: 'शुभ संध्या',
    monitoringMsg: 'मरुदम {district} में आपके {crop} खेत की निगरानी कर रहा है।',
    navDashboard: 'डैशबोर्ड', navField: 'खेत', navSensors: 'सेंसर', navInsights: 'विश्लेषण',
    plantedLabel: 'लगाया गया', notSet: 'सेट नहीं',
    fieldHealthTitle: 'खेत का स्वास्थ्य',
    fieldHealthNormalDesc: 'आपके खेत की स्थिति वर्तमान में अपेक्षित सीमा के भीतर है।',
    fieldHealthWatchDesc: 'कुछ स्थितियां अपेक्षित सीमा से थोड़ी बाहर हैं। बारीकी से निगरानी करें।',
    fieldHealthAttentionDesc: 'तत्काल ध्यान देने की आवश्यकता हो सकती है। स्थितियां सुरक्षित सीमा से बाहर हैं।',
    recommendationTitleUpper: 'मरुदम की सिफारिश', reason: 'कारण',
    awaitingData: 'सिफारिश के लिए पर्याप्त डेटा की प्रतीक्षा है।',
    liveSensorsTitle: 'लाइव खेत सेंसर', updatedLabel: 'अपडेट किया गया',
    waitingEsp32Title: 'ESP32 की प्रतीक्षा', waitingEsp32Desc: 'आपका फील्ड डिवाइस हाल ही में कनेक्ट नहीं हुआ है। ESP32 के ऑनलाइन होने पर लाइव सेंसर रीडिंग यहां दिखाई देगी।',
    expLabel: 'अनुमानित', statusLow: 'कम', statusHigh: 'अधिक', statusOptimal: 'अनुकूल',
    learningUpper: 'मरुदम आपके खेत को सीख रहा है', learningDescLong: 'मरुदम समय के साथ आपके विशिष्ट खेत की सामान्य स्थितियों को सीखता है और उनका उपयोग असामान्य परिवर्तनों का सटीक रूप से पता लगाने के लिए करता है।',
    readingsCount: 'रीडिंग', rangeLabel: 'सीमा',
    initialLearningActive: 'प्रारंभिक सीखने का चरण सक्रिय है। सटीक बेसलाइन जल्द ही दिखाई देंगी।',
    weatherContextTitle: 'मौसम का संदर्भ', howThisAffectsYou: 'यह आपको कैसे प्रभावित करता है',
    weatherHighRainDesc: 'बारिश की संभावना अधिक है। यदि संभव हो तो सिंचाई में देरी करें।', weatherLowRainDesc: 'बारिश की संभावना कम है। मिट्टी की नमी की बारीकी से निगरानी करें।',
    rootZoneUpperTitle: 'जड़ क्षेत्र की स्थिति', rootZoneLowDesc: 'उप-सतह की नमी कम होने की संभावना है। गहरी सिंचाई की आवश्यकता हो सकती है।',
    rootZoneHighDesc: 'उप-सतह संतृप्त है। उचित जल निकासी सुनिश्चित करें।', rootZoneNormalDesc: 'सतह की रीडिंग और मौसम के आधार पर जड़ क्षेत्र की नमी पर्याप्त प्रतीत होती है।',
    aiEstimated: 'AI द्वारा अनुमानित', waitingRootZone: 'जड़ क्षेत्र का अनुमान लगाने के लिए पर्याप्त डेटा की प्रतीक्षा है।',
    fieldEventsUpper: 'खेत की घटनाएँ', noUnusualEvents: 'हाल ही में कोई असामान्य घटना नहीं देखी गई।',
    durationMins: 'मिनट अवधि', severityLabel: 'गंभीरता',
    sensorDetailsTitle: 'सेंसर विवरण', sensorDetailsDesc: 'मरुदम द्वारा निरंतर अवधि में अधिक क्षेत्र डेटा एकत्र करने के बाद ऐतिहासिक रीडिंग और विस्तृत रुझान दिखाई देंगे।',
 whatShouldIDo: 'मुझे क्या करना चाहिए?', why: 'क्यों?', fieldConditions: 'खेत की स्थिति',

  },
  recommendation: {
    MONITOR: 'आपका खेत सामान्य दिख रहा है। नियमित रूप से निगरानी जारी रखें।',
    CONSIDER_IRRIGATION: 'आपका खेत सामान्य से अधिक सूखा है और बारिश की संभावना कम है। खेत की जाँच करें और सिंचाई पर विचार करें।',
    WAIT_FOR_RAIN: 'आपका खेत सूखा है लेकिन जल्द बारिश की उम्मीद है। बारिश के बाद फिर से जाँचें।',
    CHECK_FIELD: 'खेत जाएँ और मिट्टी की स्थिति सीधे जाँचें।',
    REDUCE_WATER: 'आपके खेत में सामान्य से अधिक नमी है। अभी सिंचाई कम करें।',
  },
  evidence: {
    MOISTURE_DROP_PERSISTENT: 'मिट्टी की नमी लंबे समय से सामान्य से कम है।',
    MOISTURE_DROP_RECENT: 'मिट्टी की नमी हाल ही में सामान्य से कम हुई है।',
    MOISTURE_BELOW_BASELINE: 'मिट्टी की नमी आपके खेत की सामान्य सीमा से कम है।',
    MOISTURE_ABOVE_BASELINE: 'मिट्टी की नमी आपके खेत की सामान्य सीमा से अधिक है।',
    ROOT_ZONE_MOISTURE_LOW: 'जड़ क्षेत्र में नमी कम होने का अनुमान है।',
    HIGH_SURROUNDING_TEMPERATURE: 'परिवेश तापमान अधिक है, जिससे पानी का वाष्पीकरण बढ़ता है।',
    LOW_AIR_HUMIDITY: 'वायु आर्द्रता कम है, जिससे वाष्पीकरण बढ़ता है।',
    HIGH_RAIN_PROBABILITY: 'निकट भविष्य में बारिश की संभावना है।',
    LOW_RAIN_PROBABILITY: 'निकट भविष्य में बारिश की संभावना कम है।',
    DELAY_IRRIGATION_RAIN_EXPECTED: 'जल्द बारिश की उम्मीद है — अभी सिंचाई की जरूरत नहीं।',
    WEATHER_UNAVAILABLE: 'मौसम पूर्वानुमान डेटा उपलब्ध नहीं है।',
    BASELINE_CONFIDENCE_LOW: 'मरुदम अभी भी आपके खेत को सीख रहा है — आधार रेखा अभी भरोसेमंद नहीं है।',
    NO_SENSOR_DATA: 'अभी तक कोई सेंसर डेटा नहीं मिला।',
    AWAITING_BASELINE: 'आपके खेत की आधार रेखा स्थापित होने की प्रतीक्षा है।',
  },
  events: {
    NEW: 'नया', ONGOING: 'जारी', PERSISTENT: 'लगातार', RESOLVED: 'हल',
    SOIL_MOISTURE_DROP: 'नमी में गिरावट', SOIL_MOISTURE_SURGE: 'नमी में वृद्धि',
    TEMPERATURE_SPIKE: 'तापमान उछाल', HUMIDITY_DROP: 'आर्द्रता में कमी',
  },
  risk: {
    NONE: 'कोई खतरा नहीं', WATER_DEFICIT: 'पानी की कमी का खतरा', WATERLOGGING: 'जलभराव का खतरा',
    HEAT_STRESS: 'गर्मी का तनाव', LOW_LIGHT: 'कम रोशनी',
    label: 'खतरा', levelLow: 'कम', levelModerate: 'मध्यम', levelHigh: 'अधिक',
  },
  chat: {
    title: 'मरुदम से पूछें', askButton: 'मरुदम से पूछें', placeholder: 'अपने खेत के बारे में पूछें…',
    usingFieldData: 'आपके खेत का डेटा उपयोग कर रहे हैं', thinking: 'सोच रहे हैं…', send: 'भेजें', close: 'बंद करें',
    suggestedTitle: 'आप पूछ सकते हैं:',
    suggested1: 'मुझे सिंचाई क्यों करनी चाहिए?',
    suggested2: 'क्या आज बारिश की उम्मीद है?',
    suggested3: 'मेरे खेत की स्थिति सावधानी क्यों दिखा रही है?',
    suggested4: 'मेरे खेत में सामान्य से क्या अलग है?',
    suggested5: 'मरुदम मेरे खेत को कैसे सीख रहा है?',
    suggested6: 'मेरे मिट्टी की नमी का मतलब क्या है?',
    errorNotConfigured: 'AI सहायक अभी कॉन्फ़िगर नहीं है।',
    errorGeneral: 'कुछ गलत हुआ। कृपया पुनः प्रयास करें।',
    emptyState: 'अपने खेत के बारे में कुछ भी पूछें।',
  },
  baseline: {
    scheduleTitle: 'खेत सीखने की अनुसूची', learning: 'सीख रहा है…', learningComplete: 'सीखना पूर्ण',
    daysRemaining: 'दिन शेष', nextReviewDate: 'अगली समीक्षा',
    reasonStable: 'परिस्थितियाँ स्थिर हैं — छोटी सीखने की अवधि पर्याप्त हो सकती है।',
    reasonModerate: 'परिस्थितियाँ मध्यम रूप से बदलती हैं — मानक अवधि उपयोग हो रही है।',
    reasonHighVariability: 'मौसम बार-बार बदल रहा है — लंबी अवधि उपयोग हो रही है ताकि अस्थायी स्थिति को सामान्य न माना जाए।',
    reasonNewCrop: 'नई फसल या चरण — नई सीखने की अवधि शुरू हो रही है।',
    reviewDue: 'आधार रेखा समीक्षा की सिफारिश है।', versionLabel: 'आधार रेखा संस्करण',
  },
  onboarding: {
    noDevice: 'सेंसर जुड़ा नहीं है', noDeviceDesc: 'अपने खेत की निगरानी शुरू करने के लिए ESP32 सेंसर डिवाइस जोड़ें।',
    deviceConnected: 'सेंसर जुड़ा है', setupComplete: 'सेटअप पूर्ण', welcomeFarmer: 'मरुदम में आपका स्वागत है',
  },
  common: {
    loading: 'लोड हो रहा है…', error: 'त्रुटि', retry: 'पुनः प्रयास', save: 'सहेजें', saved: 'सहेजा',
    cancel: 'रद्द करें', confirm: 'पुष्टि करें', days: 'दिन', hours: 'घंटे', minutes: 'मिनट',
    percent: '%', celsius: '°C', lux: 'lux', notAvailable: 'N/A', ago: 'पहले', justNow: 'अभी', today: 'आज',
  },
};

// =============================================================================
// TAMIL
// =============================================================================
const ta: Translations = {

  settings: {
    title: 'அமைப்புகள்',
    profile: 'சுயவிவரம்', farmerName: 'விவசாயி பெயர்', farmInfo: 'வயல் தகவல்', editProfile: 'சுயவிவரத்தை திருத்து',
    language: 'மொழி',
    notifications: 'அறிவிப்புகள்', fieldEvents: 'வயல் நிகழ்வு அறிவிப்புகள்', recommendations: 'பரிந்துரை அறிவிப்புகள்', deviceAlerts: 'சாதன எச்சரிக்கைகள்',
    cropAndField: 'பயிர் & வயல்', climateZone: 'காலநிலை மண்டலம்', season: 'பருவம்', growthStage: 'வளர்ச்சி நிலை', sowingDate: 'விதைத்த தேதி',
    adaptiveBaseline: 'தகவமைப்பு அடிப்படை', learningStatus: 'கற்றல் நிலை', baselineConfidence: 'அடிப்படை நம்பிக்கை', reviewSchedule: 'மதிப்பாய்வு அட்டவணை', baselineExplanation: 'மருடம் உங்கள் வயலின் இயல்பான நிலைகளை தொடர்ந்து கற்றுக்கொள்கிறது.',
    device: 'சாதனம்', esp32Status: 'ESP32 இணைப்பு நிலை', lastCommunication: 'கடைசி தொடர்பு', sensorStatus: 'சென்சார் இணைப்பு நிலை',
    aiAssistant: 'AI உதவியாளர்', askMarudamStatus: 'மருடமிடம் கேள் நிலை', configStatus: 'கட்டமைப்பு நிலை', aiNotConfigured: 'AI உதவியாளர் இன்னும் கட்டமைக்கப்படவில்லை.',
    aboutMarudam: 'மருடம் பற்றி', version: 'பதிப்பு', purpose: 'நோக்கம்',
    save: 'சேமி', saving: 'சேமிக்கிறது...', savedSuccessfully: 'வெற்றிகரமாக சேமிக்கப்பட்டது.', saveFailed: 'சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
    notAvailable: 'கிடைக்கவில்லை', waitingForEsp: 'ESP32 க்காக காத்திருக்கிறது'
  },
  helpCenter: {
    title: 'உதவி மையம்',
    gettingStarted: 'தொடங்குதல்', howItWorks: 'மருடம் எப்படி வேலை செய்கிறது', readFieldHealth: 'வயல் ஆரோக்கியத்தை எப்படிப் படிப்பது', howSensorsWork: 'சென்சார்கள் எப்படி வேலை செய்கின்றன',
    sensors: 'சென்சார்கள்', soilMoisture: 'மண் ஈரப்பதம்', soilTemp: 'மண் வெப்பநிலை', lightIntensity: 'ஒளி தீவிரம்', airHumidity: 'காற்றில் ஈரப்பதம்', surroundingTemp: 'சுற்றுப்புற வெப்பநிலை',
    fieldHealth: 'வயல் ஆரோக்கியம்', healthy: 'ஆரோக்கியமானது', watch: 'கண்காணிப்பு', attention: 'கவனம் தேவை',
    recommendations: 'பரிந்துரைகள்', whatRecommendationsMean: 'பரிந்துரைகளின் அர்த்தம் என்ன', confidence: 'நம்பிக்கை', urgency: 'அவசரம்',
    adaptiveBaseline: 'தகவமைப்பு அடிப்படை', whatMarudamLearns: 'மருடம் என்ன கற்றுக்கொள்கிறது', whyBaselineChanges: 'அடிப்படை ஏன் மாறுகிறது', whyWeatherAffects: 'வானிலை கற்றலை ஏன் பாதிக்கிறது',
    esp32: 'ESP32', howToConnect: 'சாதனத்தை எப்படி இணைப்பது', deviceOffline: 'சாதனம் ஆஃப்லைனில் இருக்கும்போது என்ன நடக்கும்',
    askMarudam: 'மருடமிடம் கேள்', howToAsk: 'கேள்விகள் கேட்பது எப்படி', supportedLanguages: 'ஆதரிக்கப்படும் மொழிகள்'
  },
  brand: { name: 'மருடம்', tagline: 'உங்கள் வயலை அறிந்துகொள்ளுங்கள். நம்பிக்கையுடன் வளர்த்தெடுங்கள்.' },
  nav: {
    home: 'முகப்பு', about: 'எங்களை பற்றி', features: 'சிறப்பம்சங்கள்',
    login: 'உள்நுழைக', register: 'கணக்கு உருவாக்கு',
    dashboard: 'டாஷ்போர்டு', logout: 'வெளியேறு', myProfile: 'என் சுயவிவரம்',
  },
  login: {
    welcome: 'மீண்டும் வரவேற்கிறோம்', subtitle: 'உங்கள் வயல் டாஷ்போர்டில் உள்நுழையுங்கள்',
    email: 'மின்னஞ்சல் முகவரி', password: 'கடவுச்சொல்',
    forgotPassword: 'கடவுச்சொல் மறந்துவிட்டதா?',
    signIn: 'உள்நுழைக', signingIn: 'உள்நுழைகிறது…',
    noAccount: 'கணக்கு இல்லையா?', createAccount: 'கணக்கு உருவாக்கு',
    backToHome: 'திரும்பு', errorInvalidCredentials: 'மின்னஞ்சல் அல்லது கடவுச்சொல் தவறானது.',
    errorGeneral: 'உள்நுழைவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.',
    errorEmailRequired: 'மின்னஞ்சல் தேவை.', errorPasswordRequired: 'கடவுச்சொல் தேவை.',
  },
  register: {
    title: 'விவசாயி கணக்கு உருவாக்கு', subtitle: 'உங்கள் மருடம் வயல் சுயவிவரத்தை அமைக்கவும்',
    step1Title: 'கணக்கு விவரங்கள்', step2Title: 'உங்கள் இடம்', step3Title: 'உங்கள் பயிர்',
    name: 'உங்கள் பெயர்', namePlaceholder: 'எ.கா. ரவி குமார்',
    email: 'மின்னஞ்சல் முகவரி', emailPlaceholder: 'you@example.com',
    password: 'கடவுச்சொல்', passwordPlaceholder: 'குறைந்தது 8 எழுத்துகள்',
    confirmPassword: 'கடவுச்சொல் உறுதிப்படுத்தவும்', confirmPasswordPlaceholder: 'மீண்டும் கடவுச்சொல் உள்ளிடவும்',
    language: 'விருப்பமான மொழி', state: 'மாநிலம்', district: 'மாவட்டம்',
    selectState: 'மாநிலம் தேர்ந்தெடுக்கவும்', selectDistrict: 'மாவட்டம் தேர்ந்தெடுக்கவும்',
    crop: 'முதன்மை பயிர்', selectCrop: 'பயிர் தேர்ந்தெடுக்கவும்',
    sowingDate: 'விதைப்பு தேதி', deviceId: 'சாதன ஐடி', deviceIdPlaceholder: 'எ.கா. FIELD_001',
    deviceIdOptional: 'விரும்பினால் — பின்னர் சேர்க்கலாம்',
    next: 'அடுத்து', back: 'திரும்பு', createAccount: 'கணக்கு உருவாக்கு', creatingAccount: 'உருவாக்குகிறது…',
    alreadyHaveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?', signIn: 'உள்நுழைக',
    errorNameRequired: 'பெயர் தேவை.', errorEmailInvalid: 'சரியான மின்னஞ்சல் உள்ளிடவும்.',
    errorPasswordShort: 'கடவுச்சொல் குறைந்தது 8 எழுத்துகள் இருக்க வேண்டும்.',
    errorPasswordMatch: 'கடவுச்சொற்கள் பொருந்தவில்லை.',
    errorStateRequired: 'மாநிலம் தேர்ந்தெடுக்கவும்.', errorDistrictRequired: 'மாவட்டம் தேர்ந்தெடுக்கவும்.',
    errorCropRequired: 'பயிர் தேர்ந்தெடுக்கவும்.',
    successMessage: 'கணக்கு உருவாக்கப்பட்டது! டாஷ்போர்டுக்கு செல்கிறோம்…',
  },
  dashboard: {
    title: 'மருடம்', subtitle: 'உங்கள் வயல், இன்று',
    farmerProfile: 'விவசாயி சுயவிவரம்', farmerName: 'விவசாயி',
    language: 'மொழி', state: 'மாநிலம்', district: 'மாவட்டம்',
    crop: 'பயிர்', sowingDate: 'விதைப்பு தேதி',
    saveProfile: 'சுயவிவரம் சேமிக்கவும்', profileSaved: 'சேமிக்கப்பட்டது!',
    agriculturalContext: 'விவசாய சூழல்', climateZone: 'காலநிலை மண்டலம்',
    estimatedSeason: 'பருவம்', growthStage: 'வளர்ச்சி நிலை',
    regionalConditions: 'பிராந்திய நிலைமைகள்', regionalNote: 'பிராந்திய அடிப்படை',
    fieldLearningActive: 'வயல் கற்றல் செயலில் உள்ளது',
    adaptiveBaseline: 'தகவமைப்பு அடிப்படை', adaptiveBaselineDesc: 'மருடம் உங்கள் வயலைக் கற்றுக்கொள்கிறது',
    observations: 'கவனிப்புகள்', confidence: 'நம்பகத்தன்மை',
    confidenceLow: 'குறைவு', confidenceMedium: 'உருவாகிறது', confidenceHigh: 'நல்லது',
    liveFieldConditions: 'வயல் நிலைமைகள்', withinRange: 'சாதாரணம்', belowRange: 'வழக்கத்திற்கும் குறைவு', aboveRange: 'வழக்கத்திற்கும் அதிகம்',
    waitingForEsp: 'சென்சார் தரவுக்காக காத்திருக்கிறது…', noSensorData: 'இன்னும் சென்சார் தரவு இல்லை',
    fieldEvents: 'வயல் நிகழ்வுகள்', noEventsDetected: 'அசாதாரண நிகழ்வுகள் இல்லை',
    severity: 'தீவிரம்', duration: 'கால அளவு',
    moreDetails: 'மேலும் விவரங்கள்', hideDetails: 'விவரங்களை மறைக்கவும்', logout: 'வெளியேறு',
    fieldStatus: 'வயல் நிலை',
    fieldStatusNormal: 'சாதாரணம்', fieldStatusWatch: 'கவனிக்கவும்', fieldStatusAttention: 'கவனம் தேவை', fieldStatusUncertain: 'நிச்சயமற்றது',
    recommendationTitle: 'நான் என்ன செய்ய வேண்டும்?', evidenceSuggestsTitle: 'ஏன்?', recommendationAction: 'பரிந்துரைக்கப்பட்ட நடவடிக்கை',
    confidence_label: 'நம்பகத்தன்மை',
    deviceStatus: 'சென்சார் சாதனம்', deviceOnline: 'இணைக்கப்பட்டுள்ளது', deviceStale: 'பழையது', deviceOffline: 'இணைப்பில்லை', deviceUnknown: 'தெரியவில்லை',
    weatherTitle: 'வானிலை', rainProbability: 'மழை வாய்ப்பு',
    rainUnlikely: 'இன்று மழை வாய்ப்பு குறைவு.', rainLikely: 'விரைவில் மழை வரலாம்.',
    rainMaybeWait: 'மழை வரலாம். நீர்ப்பாசனத்திற்கு முன் காத்திருக்கவும்.',
    weatherUnavailable: 'வானிலை தரவு கிடைக்கவில்லை.', weatherSimulation: 'உருவகப்படுத்தப்பட்ட வானிலை',
    temperature: 'வெப்பநிலை',
    rootZoneTitle: 'வேர் மண்டலம்', rootZoneMoistureLabel: 'வேர் ஈரப்பதம்',
    rootZoneLow: 'குறைவு', rootZoneNormal: 'சாதாரணம்', rootZoneHigh: 'அதிகம்', rootZoneUnknown: 'தெரியவில்லை',
    rootZoneEstimatedNote: 'மதிப்பிடப்பட்டது — நேரடியாக அளவிடப்படவில்லை',
    sensorSoilMoisture: 'மண் ஈரப்பதம்', sensorSoilTemperature: 'மண் வெப்பநிலை',
    sensorAirHumidity: 'காற்று ஈரப்பதம்', sensorSurroundingTemp: 'சுற்றுப்புற வெப்பநிலை', sensorLight: 'ஒளி',
    sensorUsual: 'உங்கள் வயலில் வழக்கமாக', sensorCurrent: 'தற்போது',
    fieldLearning: 'வயல் கற்றல்', fieldLearningDesc: 'மருடம் உங்கள் வயலில் என்ன சாதாரணம் என்று கற்றுக்கொள்கிறது.',
    learningPeriodDays: 'கற்றல் காலம்', nextReview: 'அடுத்த மறுஆய்வு', learningReason: 'காரணம்',
    todayFieldStatus: 'இன்றைய வயல் நிலை', whatShouldIDo: 'நான் என்ன செய்ய வேண்டும்?', why: 'ஏன்?', fieldConditions: 'வயல் நிலைமைகள்',
    welcomeMorning: 'காலை வணக்கம்', welcomeAfternoon: 'மதிய வணக்கம்', welcomeEvening: 'மாலை வணக்கம்',
    monitoringMsg: 'மருடம் {district} இல் உங்கள் {crop} வயலை கண்காணிக்கிறது.',
    navDashboard: 'டாஷ்போர்டு', navField: 'வயல்', navSensors: 'சென்சார்கள்', navInsights: 'பகுப்பாய்வுகள்',
    plantedLabel: 'நட்ட நாள்', notSet: 'அமைக்கப்படவில்லை',
    fieldHealthTitle: 'வயல் ஆரோக்கியம்',
    fieldHealthNormalDesc: 'உங்கள் வயலின் தற்போதைய நிலை எதிர்பார்க்கப்படும் வரம்பிற்குள் உள்ளது.',
    fieldHealthWatchDesc: 'சில நிலைமைகள் இயல்பை விட சற்று விலகியுள்ளன. கவனமாக கண்காணிக்கவும்.',
    fieldHealthAttentionDesc: 'உடனடி கவனம் தேவைப்படலாம். நிலைமைகள் பாதுகாப்பான வரம்பை தாண்டியுள்ளன.',
    recommendationTitleUpper: 'மருடம் பரிந்துரைக்கிறது', reason: 'காரணம்',
    awaitingData: 'பரிந்துரைக்க போதுமான தரவுகளுக்காக காத்திருக்கிறது.',
    liveSensorsTitle: 'நிகழ்நேர வயல் சென்சார்கள்', updatedLabel: 'புதுப்பிக்கப்பட்டது',
    waitingEsp32Title: 'ESP32 க்காக காத்திருக்கிறது', waitingEsp32Desc: 'உங்கள் சென்சார் சமீபத்தில் இணைக்கப்படவில்லை. ESP32 ஆன்லைனில் வரும்போது நிகழ்நேர அளவீடுகள் இங்கே தோன்றும்.',
    expLabel: 'எதிர்', statusLow: 'குறைவு', statusHigh: 'அதிகம்', statusOptimal: 'உகந்தது',
    learningUpper: 'மருடம் உங்கள் வயலைக் கற்றுக்கொள்கிறது', learningDescLong: 'மருடம் உங்கள் வயலின் இயல்பான நிலைமைகளை காலப்போக்கில் கற்றுக்கொள்கிறது மற்றும் அசாதாரண மாற்றங்களை துல்லியமாக கண்டறிய அவற்றை பயன்படுத்துகிறது.',
    readingsCount: 'அளவீடுகள்', rangeLabel: 'வரம்பு',
    initialLearningActive: 'ஆரம்ப கற்றல் கட்டம் செயலில் உள்ளது. துல்லியமான அடிப்படை தரவுகள் விரைவில் தோன்றும்.',
    weatherContextTitle: 'வானிலை சூழல்', howThisAffectsYou: 'இது உங்களை எவ்வாறு பாதிக்கிறது',
    weatherHighRainDesc: 'மழைக்கான வாய்ப்பு அதிகம். முடிந்தால் நீர்ப்பாசனத்தை தாமதப்படுத்தவும்.', weatherLowRainDesc: 'மழைக்கான வாய்ப்பு குறைவு. மண் ஈரப்பதத்தை கவனமாக கண்காணிக்கவும்.',
    rootZoneUpperTitle: 'வேர் மண்டல நிலை', rootZoneLowDesc: 'மேற்பரப்பிற்கு கீழ் ஈரப்பதம் குறைய வாய்ப்புள்ளது. ஆழமான நீர்ப்பாசனம் தேவைப்படலாம்.',
    rootZoneHighDesc: 'மேற்பரப்பிற்கு கீழ் அதிக ஈரப்பதம் உள்ளது. முறையான வடிகால் வசதியை உறுதி செய்யவும்.', rootZoneNormalDesc: 'மேற்பரப்பு அளவீடுகள் மற்றும் வானிலையின் அடிப்படையில் வேர் மண்டல ஈரப்பதம் போதுமானதாக தோன்றுகிறது.',
    aiEstimated: 'AI கணிப்பு', waitingRootZone: 'வேர் மண்டலத்தை கணிக்க போதுமான தரவுகளுக்காக காத்திருக்கிறது.',
    fieldEventsUpper: 'வயல் நிகழ்வுகள்', noUnusualEvents: 'சமீபத்தில் எந்த அசாதாரண நிகழ்வுகளும் கண்டறியப்படவில்லை.',
    durationMins: 'நிமிடங்கள் நீடித்தது', severityLabel: 'தீவிரம்',
    sensorDetailsTitle: 'சென்சார் விவரங்கள்', sensorDetailsDesc: 'மருடம் மேலும் வயல் தரவுகளை சேகரித்த பிறகு வரலாற்று அளவீடுகள் மற்றும் விரிவான போக்குகள் தோன்றும்.',

  },
  recommendation: {
    MONITOR: 'உங்கள் வயல் சாதாரணமாக உள்ளது. தொடர்ந்து கவனிக்கவும்.',
    CONSIDER_IRRIGATION: 'உங்கள் வயல் வழக்கத்திற்கும் வறண்டிருக்கிறது, மழை வாய்ப்பும் குறைவாக உள்ளது. வயலை பரிசோதித்து நீர்ப்பாசனத்தை கருத்தில் கொள்ளுங்கள்.',
    WAIT_FOR_RAIN: 'வயல் வறண்டிருக்கிறது, ஆனால் விரைவில் மழை வரும் என எதிர்பார்க்கப்படுகிறது. மழைக்குப் பிறகு மீண்டும் சரிபாருங்கள்.',
    CHECK_FIELD: 'வயலுக்குச் சென்று மண்ணின் நிலையை நேரடியாக சரிபாருங்கள்.',
    REDUCE_WATER: 'உங்கள் வயலில் வழக்கத்திற்கும் அதிக ஈரப்பதம் உள்ளது. இப்போதைக்கு நீர்ப்பாசனத்தை குறைக்கவும்.',
  },
  evidence: {
    MOISTURE_DROP_PERSISTENT: 'மண் ஈரப்பதம் நீண்ட காலமாக சாதாரண அளவிற்கும் குறைவாக உள்ளது.',
    MOISTURE_DROP_RECENT: 'மண் ஈரப்பதம் சமீபத்தில் சாதாரண அளவிற்கும் குறைந்துள்ளது.',
    MOISTURE_BELOW_BASELINE: 'மண் ஈரப்பதம் உங்கள் வயலின் வழக்கமான வரம்பிற்கும் குறைவாக உள்ளது.',
    MOISTURE_ABOVE_BASELINE: 'மண் ஈரப்பதம் உங்கள் வயலின் வழக்கமான வரம்பிற்கும் அதிகமாக உள்ளது.',
    ROOT_ZONE_MOISTURE_LOW: 'வேர் மண்டல ஈரப்பதம் குறைவாக இருப்பதாக மதிப்பிடப்படுகிறது.',
    HIGH_SURROUNDING_TEMPERATURE: 'சுற்றுப்புற வெப்பநிலை அதிகமாக உள்ளது, இது நீர் ஆவியாதலை அதிகரிக்கிறது.',
    LOW_AIR_HUMIDITY: 'காற்று ஈரப்பதம் குறைவாக உள்ளது, இது ஆவியாதலை அதிகரிக்கிறது.',
    HIGH_RAIN_PROBABILITY: 'அண்மையில் மழை வருவதற்கான வாய்ப்பு அதிகம்.',
    LOW_RAIN_PROBABILITY: 'அண்மையில் மழை வருவதற்கான வாய்ப்பு குறைவு.',
    DELAY_IRRIGATION_RAIN_EXPECTED: 'விரைவில் மழை வரும் என எதிர்பார்க்கப்படுகிறது — இப்போது நீர்ப்பாசனம் தேவையில்லை.',
    WEATHER_UNAVAILABLE: 'வானிலை முன்னறிவிப்பு தரவு கிடைக்கவில்லை.',
    BASELINE_CONFIDENCE_LOW: 'மருடம் இன்னும் உங்கள் வயலைக் கற்றுக்கொள்கிறது — அடிப்படை இன்னும் நம்பகமாக இல்லை.',
    NO_SENSOR_DATA: 'இன்னும் சென்சார் தரவு வரவில்லை.',
    AWAITING_BASELINE: 'உங்கள் வயலின் அடிப்படை நிறுவப்படுவதற்காக காத்திருக்கிறோம்.',
  },
  events: {
    NEW: 'புதியது', ONGOING: 'நடந்துகொண்டிருக்கிறது', PERSISTENT: 'தொடர்ச்சியானது', RESOLVED: 'தீர்க்கப்பட்டது',
    SOIL_MOISTURE_DROP: 'ஈரப்பதம் குறைவு', SOIL_MOISTURE_SURGE: 'ஈரப்பதம் அதிகரிப்பு',
    TEMPERATURE_SPIKE: 'வெப்பநிலை திடீர் உயர்வு', HUMIDITY_DROP: 'ஈரப்பதம் குறைவு',
  },
  risk: {
    NONE: 'அபாயம் இல்லை', WATER_DEFICIT: 'நீர் பற்றாக்குறை அபாயம்', WATERLOGGING: 'நீர் தேக்கம் அபாயம்',
    HEAT_STRESS: 'வெப்ப அழுத்தம்', LOW_LIGHT: 'குறைந்த ஒளி',
    label: 'அபாயம்', levelLow: 'குறைவு', levelModerate: 'மிதமான', levelHigh: 'அதிகம்',
  },
  chat: {
    title: 'மருடத்திடம் கேளுங்கள்', askButton: 'மருடத்திடம் கேளுங்கள்', placeholder: 'உங்கள் வயலைப் பற்றி கேளுங்கள்…',
    usingFieldData: 'உங்கள் வயல் தரவைப் பயன்படுத்துகிறது', thinking: 'யோசிக்கிறது…', send: 'அனுப்பு', close: 'மூடு',
    suggestedTitle: 'நீங்கள் கேட்கலாம்:',
    suggested1: 'நான் ஏன் நீர்ப்பாசனம் செய்ய வேண்டும்?',
    suggested2: 'இன்று மழை வரும் என எதிர்பார்க்கலாமா?',
    suggested3: 'என் வயல் ஏன் கவனம் தேவை என காட்டுகிறது?',
    suggested4: 'என் வயலில் வழக்கத்திற்கு மாறாக என்ன உள்ளது?',
    suggested5: 'மருடம் என் வயலை எப்படி கற்றுக்கொள்கிறது?',
    suggested6: 'என் மண் ஈரப்பதம் மதிப்பு என்ன அர்த்தம்?',
    errorNotConfigured: 'AI உதவியாளர் இன்னும் கட்டமைக்கப்படவில்லை.',
    errorGeneral: 'ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும்.',
    emptyState: 'உங்கள் வயலைப் பற்றி எதுவும் கேளுங்கள்.',
  },
  baseline: {
    scheduleTitle: 'வயல் கற்றல் அட்டவணை', learning: 'கற்றுக்கொள்கிறது…', learningComplete: 'கற்றல் முடிந்தது',
    daysRemaining: 'நாட்கள் மீதம்', nextReviewDate: 'அடுத்த மறுஆய்வு',
    reasonStable: 'நிலைமைகள் நிலையானவை — குறுகிய கற்றல் காலம் போதுமானது.',
    reasonModerate: 'நிலைமைகள் மிதமாக மாறுகின்றன — நிலையான கற்றல் காலம் பயன்படுத்தப்படுகிறது.',
    reasonHighVariability: 'வானிலை அடிக்கடி மாறுகிறது — தற்காலிக நிலையை சாதாரணம் என கற்காமல் இருக்க நீண்ட கற்றல் காலம் பயன்படுத்தப்படுகிறது.',
    reasonNewCrop: 'புதிய பயிர் அல்லது நிலை — புதிய கற்றல் காலம் தொடங்கப்படுகிறது.',
    reviewDue: 'அடிப்படை மறுஆய்வு பரிந்துரைக்கப்படுகிறது.', versionLabel: 'அடிப்படை பதிப்பு',
  },
  onboarding: {
    noDevice: 'சென்சார் இணைக்கப்படவில்லை', noDeviceDesc: 'உங்கள் வயலை கண்காணிக்கத் தொடங்க ESP32 சென்சார் சாதனத்தை இணைக்கவும்.',
    deviceConnected: 'சென்சார் இணைக்கப்பட்டுள்ளது', setupComplete: 'அமைப்பு முடிந்தது',
    welcomeFarmer: 'மருடத்திற்கு வரவேற்கிறோம்',
  },
  common: {
    loading: 'ஏற்றுகிறது…', error: 'பிழை', retry: 'மீண்டும் முயற்சி', save: 'சேமிக்கவும்', saved: 'சேமிக்கப்பட்டது',
    cancel: 'ரத்து', confirm: 'உறுதிப்படுத்தவும்', days: 'நாட்கள்', hours: 'மணி', minutes: 'நிமிடம்',
    percent: '%', celsius: '°C', lux: 'lux', notAvailable: 'இல்லை', ago: 'முன்பு', justNow: 'இப்போது', today: 'இன்று',
  },
};

// =============================================================================
// TELUGU
// =============================================================================
const te: Translations = {

  settings: {
    title: 'సెట్టింగ్‌లు',
    profile: 'ప్రొఫైల్', farmerName: 'రైతు పేరు', farmInfo: 'పొలం సమాచారం', editProfile: 'ప్రొఫైల్‌ను సవరించండి',
    language: 'భాష',
    notifications: 'నోటిఫికేషన్‌లు', fieldEvents: 'పొలం ఈవెంట్ నోటిఫికేషన్‌లు', recommendations: 'సిఫార్సు నోటిఫికేషన్‌లు', deviceAlerts: 'పరికర హెచ్చరికలు',
    cropAndField: 'పంట & పొలం', climateZone: 'వాతావరణ జోన్', season: 'సీజన్', growthStage: 'పెరుగుదల దశ', sowingDate: 'నాటిన తేదీ',
    adaptiveBaseline: 'అనుకూల బేస్‌లైన్', learningStatus: 'నేర్చుకునే స్థితి', baselineConfidence: 'బేస్‌లైన్ విశ్వాసం', reviewSchedule: 'సమీక్ష షెడ్యూల్', baselineExplanation: 'మరుదం మీ పొలం యొక్క సాధారణ పరిస్థితులను నిరంతరం నేర్చుకుంటుంది.',
    device: 'పరికరం', esp32Status: 'ESP32 కనెక్షన్ స్థితి', lastCommunication: 'చివరి కమ్యూనికేషన్', sensorStatus: 'సెన్సార్ కనెక్షన్ స్థితి',
    aiAssistant: 'AI అసిస్టెంట్', askMarudamStatus: 'మరుదంను అడగండి స్థితి', configStatus: 'కాన్ఫిగరేషన్ స్థితి', aiNotConfigured: 'AI అసిస్టెంట్ ఇంకా కాన్ఫిగర్ చేయబడలేదు.',
    aboutMarudam: 'మరుదం గురించి', version: 'వెర్షన్', purpose: 'ఉద్దేశ్యం',
    save: 'సేవ్ చేయండి', saving: 'సేవ్ అవుతోంది...', savedSuccessfully: 'విజయవంతంగా సేవ్ చేయబడింది.', saveFailed: 'సేవ్ చేయడం విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.',
    notAvailable: 'అందుబాటులో లేదు', waitingForEsp: 'ESP32 కోసం వేచి ఉంది'
  },
  helpCenter: {
    title: 'సహాయ కేంద్రం',
    gettingStarted: 'ప్రారంభించడం', howItWorks: 'మరుదం ఎలా పని చేస్తుంది', readFieldHealth: 'పొలం ఆరోగ్యాన్ని ఎలా చదవాలి', howSensorsWork: 'సెన్సార్లు ఎలా పని చేస్తాయి',
    sensors: 'సెన్సార్లు', soilMoisture: 'నేల తేమ', soilTemp: 'నేల ఉష్ణోగ్రత', lightIntensity: 'కాంతి తీవ్రత', airHumidity: 'గాలి తేమ', surroundingTemp: 'పరిసర ఉష్ణోగ్రత',
    fieldHealth: 'పొలం ఆరోగ్యం', healthy: 'ఆరోగ్యకరమైన', watch: 'నిశితంగా గమనించండి', attention: 'శ్రద్ధ వహించండి',
    recommendations: 'సిఫార్సులు', whatRecommendationsMean: 'సిఫార్సుల అర్థం ఏమిటి', confidence: 'విశ్వాసం', urgency: 'అవసరం',
    adaptiveBaseline: 'అనుకూల బేస్‌లైన్', whatMarudamLearns: 'మరుదం ఏమి నేర్చుకుంటుంది', whyBaselineChanges: 'బేస్‌లైన్ ఎందుకు మారుతుంది', whyWeatherAffects: 'వాతావరణం నేర్చుకోవడాన్ని ఎందుకు ప్రభావితం చేస్తుంది',
    esp32: 'ESP32', howToConnect: 'పరికరాన్ని ఎలా కనెక్ట్ చేయాలి', deviceOffline: 'పరికరం ఆఫ్‌లైన్‌లో ఉన్నప్పుడు ఏమి జరుగుతుంది',
    askMarudam: 'మరుదంను అడగండి', howToAsk: 'ప్రశ్నలు ఎలా అడగాలి', supportedLanguages: 'మద్దతు ఉన్న భాషలు'
  },
  brand: { name: 'మరుడం', tagline: 'మీ పొలాన్ని తెలుసుకోండి. నమ్మకంగా పండించండి.' },
  nav: {
    home: 'హోమ్', about: 'మా గురించి', features: 'ఫీచర్లు',
    login: 'లాగిన్', register: 'ఖాతా తెరవండి',
    dashboard: 'డాష్‌బోర్డ్', logout: 'లాగ్ అవుట్', myProfile: 'నా ప్రొఫైల్',
  },
  login: {
    welcome: 'తిరిగి స్వాగతం', subtitle: 'మీ పొలం డాష్‌బోర్డ్‌లో లాగిన్ అవ్వండి',
    email: 'ఇమెయిల్ చిరునామా', password: 'పాస్‌వర్డ్',
    forgotPassword: 'పాస్‌వర్డ్ మర్చిపోయారా?',
    signIn: 'లాగిన్', signingIn: 'లాగిన్ అవుతోంది…',
    noAccount: 'ఖాతా లేదా?', createAccount: 'ఖాతా తెరవండి',
    backToHome: 'వెనక్కి', errorInvalidCredentials: 'ఇమెయిల్ లేదా పాస్‌వర్డ్ తప్పు.',
    errorGeneral: 'లాగిన్ విఫలమైంది. మళ్ళీ ప్రయత్నించండి.',
    errorEmailRequired: 'ఇమెయిల్ అవసరం.', errorPasswordRequired: 'పాస్‌వర్డ్ అవసరం.',
  },
  register: {
    title: 'రైతు ఖాతా తెరవండి', subtitle: 'మీ మరుడం పొలం ప్రొఫైల్ సెట్ చేయండి',
    step1Title: 'ఖాతా వివరాలు', step2Title: 'మీ స్థానం', step3Title: 'మీ పంట',
    name: 'మీ పేరు', namePlaceholder: 'ఉదా. రవి కుమార్',
    email: 'ఇమెయిల్ చిరునామా', emailPlaceholder: 'you@example.com',
    password: 'పాస్‌వర్డ్', passwordPlaceholder: 'కనీసం 8 అక్షరాలు',
    confirmPassword: 'పాస్‌వర్డ్ నిర్ధారించండి', confirmPasswordPlaceholder: 'పాస్‌వర్డ్ మళ్ళీ నమోదు చేయండి',
    language: 'ఇష్టమైన భాష', state: 'రాష్ట్రం', district: 'జిల్లా',
    selectState: 'రాష్ట్రం ఎంచుకోండి', selectDistrict: 'జిల్లా ఎంచుకోండి',
    crop: 'ప్రధాన పంట', selectCrop: 'పంట ఎంచుకోండి',
    sowingDate: 'విత్తన తేదీ', deviceId: 'పరికర ID', deviceIdPlaceholder: 'ఉదా. FIELD_001',
    deviceIdOptional: 'ఐచ్ఛికం — తర్వాత జోడించవచ్చు',
    next: 'తదుపరి', back: 'వెనక్కి', createAccount: 'ఖాతా తెరవండి', creatingAccount: 'తెరుస్తోంది…',
    alreadyHaveAccount: 'ఇప్పటికే ఖాతా ఉందా?', signIn: 'లాగిన్',
    errorNameRequired: 'పేరు అవసరం.', errorEmailInvalid: 'సరైన ఇమెయిల్ నమోదు చేయండి.',
    errorPasswordShort: 'పాస్‌వర్డ్ కనీసం 8 అక్షరాలు ఉండాలి.',
    errorPasswordMatch: 'పాస్‌వర్డ్లు సరిపోలడం లేదు.',
    errorStateRequired: 'రాష్ట్రం ఎంచుకోండి.', errorDistrictRequired: 'జిల్లా ఎంచుకోండి.',
    errorCropRequired: 'పంట ఎంచుకోండి.',
    successMessage: 'ఖాతా తెరవబడింది! డాష్‌బోర్డ్‌కి వెళ్తోంది…',
  },
  dashboard: {
    title: 'మరుడం', subtitle: 'మీ పొలం, నేడు',
    farmerProfile: 'రైతు ప్రొఫైల్', farmerName: 'రైతు',
    language: 'భాష', state: 'రాష్ట్రం', district: 'జిల్లా',
    crop: 'పంట', sowingDate: 'విత్తన తేదీ',
    saveProfile: 'ప్రొఫైల్ సేవ్ చేయండి', profileSaved: 'సేవ్ అయింది!',
    agriculturalContext: 'వ్యవసాయ సందర్భం', climateZone: 'వాతావరణ మండలం',
    estimatedSeason: 'సీజన్', growthStage: 'వృద్ధి దశ',
    regionalConditions: 'ప్రాంతీయ పరిస్థితులు', regionalNote: 'ప్రాంతీయ బేస్‌లైన్',
    fieldLearningActive: 'పొలం నేర్చుకోవడం క్రియాశీలంగా ఉంది',
    adaptiveBaseline: 'అడాప్టివ్ బేస్‌లైన్', adaptiveBaselineDesc: 'మరుడం మీ పొలాన్ని నేర్చుకుంటోంది',
    observations: 'పరిశీలనలు', confidence: 'విశ్వాసనీయత',
    confidenceLow: 'తక్కువ', confidenceMedium: 'నిర్మించబడుతోంది', confidenceHigh: 'మంచిది',
    liveFieldConditions: 'పొలం పరిస్థితులు', withinRange: 'సాధారణం', belowRange: 'సాధారణం కంటే తక్కువ', aboveRange: 'సాధారణం కంటే ఎక్కువ',
    waitingForEsp: 'సెన్సార్ డేటా కోసం వేచి ఉంది…', noSensorData: 'ఇంకా సెన్సార్ డేటా లేదు',
    fieldEvents: 'పొలం సంఘటనలు', noEventsDetected: 'అసాధారణ సంఘటనలు లేవు',
    severity: 'తీవ్రత', duration: 'వ్యవధి',
    moreDetails: 'మరిన్ని వివరాలు', hideDetails: 'వివరాలు దాచు', logout: 'లాగ్ అవుట్',
    fieldStatus: 'పొలం స్థితి',
    fieldStatusNormal: 'సాధారణం', fieldStatusWatch: 'గమనించండి', fieldStatusAttention: 'శ్రద్ధ అవసరం', fieldStatusUncertain: 'అనిశ్చితం',
    recommendationTitle: 'నేను ఏమి చేయాలి?', evidenceSuggestsTitle: 'ఎందుకు?', recommendationAction: 'సిఫారసు చర్య',
    confidence_label: 'విశ్వాసనీయత',
    deviceStatus: 'సెన్సార్ పరికరం', deviceOnline: 'ఆన్‌లైన్', deviceStale: 'పాత', deviceOffline: 'ఆఫ్‌లైన్', deviceUnknown: 'తెలియదు',
    weatherTitle: 'వాతావరణం', rainProbability: 'వర్షం అవకాశం',
    rainUnlikely: 'నేడు వర్షం అవకాశం తక్కువ.', rainLikely: 'త్వరలో వర్షం రావచ్చు.',
    rainMaybeWait: 'వర్షం రావచ్చు. నీటిపారుదలకు ముందు వేచి ఉండండి.',
    weatherUnavailable: 'వాతావరణ డేటా అందుబాటులో లేదు.', weatherSimulation: 'అనుకరణ వాతావరణం',
    temperature: 'ఉష్ణోగ్రత',
    rootZoneTitle: 'మూల మండలం', rootZoneMoistureLabel: 'మూల తేమ',
    rootZoneLow: 'తక్కువ', rootZoneNormal: 'సాధారణం', rootZoneHigh: 'ఎక్కువ', rootZoneUnknown: 'తెలియదు',
    rootZoneEstimatedNote: 'అంచనా వేయబడింది — నేరుగా కొలవబడలేదు',
    sensorSoilMoisture: 'నేల తేమ', sensorSoilTemperature: 'నేల ఉష్ణోగ్రత',
    sensorAirHumidity: 'గాలి తేమ', sensorSurroundingTemp: 'పరిసర ఉష్ణోగ్రత', sensorLight: 'కాంతి',
    sensorUsual: 'మీ పొలంలో సాధారణంగా', sensorCurrent: 'ప్రస్తుతం',
    fieldLearning: 'పొలం నేర్చుకోవడం', fieldLearningDesc: 'మరుడం మీ పొలంలో ఏది సాధారణమో నేర్చుకుంటోంది.',
    learningPeriodDays: 'నేర్చుకోవడం కాలం', nextReview: 'తదుపరి సమీక్ష', learningReason: 'కారణం',
    todayFieldStatus: 'నేటి పొలం స్థితి', whatShouldIDo: 'నేను ఏమి చేయాలి?', why: 'ఎందుకు?', fieldConditions: 'పొలం పరిస్థితులు',
    welcomeMorning: 'శుభోదయం', welcomeAfternoon: 'శుభ మధ్యాహ్నం', welcomeEvening: 'శుభ సాయంత్రం',
    monitoringMsg: 'మరుదం {district} లో మీ {crop} పొలాన్ని పర్యవేక్షిస్తోంది.',
    navDashboard: 'డాష్‌బోర్డ్', navField: 'పొలం', navSensors: 'సెన్సార్లు', navInsights: 'విశ్లేషణలు',
    plantedLabel: 'నాటిన తేదీ', notSet: 'సెట్ చేయలేదు',
    fieldHealthTitle: 'పొలం ఆరోగ్యం',
    fieldHealthNormalDesc: 'మీ పొలం పరిస్థితులు ప్రస్తుతం ఆశించిన పరిధిలో ఉన్నాయి.',
    fieldHealthWatchDesc: 'కొన్ని పరిస్థితులు ఆశించిన పరిధికి కొద్దిగా బయట ఉన్నాయి. నిశితంగా గమనించండి.',
    fieldHealthAttentionDesc: 'తక్షణ శ్రద్ధ అవసరం కావచ్చు. పరిస్థితులు సురక్షిత పరిమితులను దాటాయి.',
    recommendationTitleUpper: 'మరుదం సిఫార్సు', reason: 'కారణం',
    awaitingData: 'సిఫార్సు చేయడానికి తగినంత డేటా కోసం వేచి ఉంది.',
    liveSensorsTitle: 'లైవ్ ఫీల్డ్ సెన్సార్లు', updatedLabel: 'నవీకరించబడింది',
    waitingEsp32Title: 'ESP32 కోసం వేచి ఉంది', waitingEsp32Desc: 'మీ ఫీల్డ్ పరికరం ఇటీవల కనెక్ట్ కాలేదు. ESP32 ఆన్‌లైన్‌కి వచ్చినప్పుడు లైవ్ సెన్సార్ రీడింగ్‌లు ఇక్కడ కనిపిస్తాయి.',
    expLabel: 'అంచనా', statusLow: 'తక్కువ', statusHigh: 'ఎక్కువ', statusOptimal: 'అనుకూలం',
    learningUpper: 'మరుదం మీ పొలాన్ని నేర్చుకుంటోంది', learningDescLong: 'మరుదం మీ పొలం యొక్క సాధారణ పరిస్థితులను కాలానుగుణంగా నేర్చుకుంటుంది మరియు అసాధారణ మార్పులను కచ్చితంగా గుర్తించడానికి వాటిని ఉపయోగిస్తుంది.',
    readingsCount: 'రీడింగులు', rangeLabel: 'పరిధి',
    initialLearningActive: 'ప్రాథమిక అభ్యాస దశ చురుకుగా ఉంది. కచ్చితమైన బేస్‌లైన్‌లు త్వరలో కనిపిస్తాయి.',
    weatherContextTitle: 'వాతావరణ సందర్భం', howThisAffectsYou: 'ఇది మిమ్మల్ని ఎలా ప్రభావితం చేస్తుంది',
    weatherHighRainDesc: 'వర్షం పడే అవకాశం ఎక్కువగా ఉంది. వీలైతే నీటిపారుదలని వాయిదా వేయండి.', weatherLowRainDesc: 'వర్షం పడే అవకాశం తక్కువ. నేల తేమను నిశితంగా గమనించండి.',
    rootZoneUpperTitle: 'రూట్-జోన్ పరిస్థితి', rootZoneLowDesc: 'ఉపరితలంలో తేమ తగ్గే అవకాశం ఉంది. లోతైన నీటిపారుదల అవసరం కావచ్చు.',
    rootZoneHighDesc: 'ఉపరితలంలో తేమ ఎక్కువగా ఉంది. సరైన మురుగునీటి వసతి కల్పించండి.', rootZoneNormalDesc: 'ఉపరితల రీడింగులు మరియు వాతావరణం ఆధారంగా రూట్ జోన్ తేమ తగినంతగా కనిపిస్తోంది.',
    aiEstimated: 'AI అంచనా', waitingRootZone: 'రూట్ జోన్‌ను అంచనా వేయడానికి తగినంత డేటా కోసం వేచి ఉంది.',
    fieldEventsUpper: 'పొలం ఈవెంట్‌లు', noUnusualEvents: 'ఇటీవల ఎటువంటి అసాధారణ ఈవెంట్‌లు కనుగొనబడలేదు.',
    durationMins: 'నిమిషాల వ్యవధి', severityLabel: 'తీవ్రత',
    sensorDetailsTitle: 'సెన్సార్ వివరాలు', sensorDetailsDesc: 'మరుదం నిరంతర వ్యవధిలో ఎక్కువ ఫీల్డ్ డేటాను సేకరించిన తర్వాత చారిత్రక రీడింగ్‌లు మరియు వివరణాత్మక పోకడలు కనిపిస్తాయి.',

  },
  recommendation: {
    MONITOR: 'మీ పొలం సాధారణంగా కనిపిస్తోంది. క్రమం తప్పకుండా పర్యవేక్షించండి.',
    CONSIDER_IRRIGATION: 'మీ పొలం సాధారణం కంటే పొడిగా ఉంది మరియు వర్షం అవకాశం తక్కువగా ఉంది. పొలాన్ని తనిఖీ చేసి నీటిపారుదల పరిగణించండి.',
    WAIT_FOR_RAIN: 'పొలం పొడిగా ఉంది కానీ త్వరలో వర్షం రావాలని అంచనా. వర్షం తర్వాత మళ్ళీ తనిఖీ చేయండి.',
    CHECK_FIELD: 'పొలానికి వెళ్ళి నేల పరిస్థితిని నేరుగా తనిఖీ చేయండి.',
    REDUCE_WATER: 'మీ పొలంలో సాధారణం కంటే ఎక్కువ తేమ ఉంది. ప్రస్తుతానికి నీటిపారుదల తగ్గించండి.',
  },
  evidence: {
    MOISTURE_DROP_PERSISTENT: 'నేల తేమ చాలా కాలంగా సాధారణం కంటే తక్కువగా ఉంది.',
    MOISTURE_DROP_RECENT: 'నేల తేమ ఇటీవల సాధారణం కంటే తగ్గింది.',
    MOISTURE_BELOW_BASELINE: 'నేల తేమ మీ పొలం సాధారణ పరిధి కంటే తక్కువగా ఉంది.',
    MOISTURE_ABOVE_BASELINE: 'నేల తేమ మీ పొలం సాధారణ పరిధి కంటే ఎక్కువగా ఉంది.',
    ROOT_ZONE_MOISTURE_LOW: 'మూల మండల తేమ తక్కువగా అంచనా వేయబడింది.',
    HIGH_SURROUNDING_TEMPERATURE: 'పరిసర ఉష్ణోగ్రత ఎక్కువగా ఉంది, ఇది నీటి ఆవిరిని పెంచుతుంది.',
    LOW_AIR_HUMIDITY: 'గాలి తేమ తక్కువగా ఉంది, ఇది ఆవిరిని పెంచుతుంది.',
    HIGH_RAIN_PROBABILITY: 'సమీప భవిష్యత్తులో వర్షం వచ్చే అవకాశం ఉంది.',
    LOW_RAIN_PROBABILITY: 'సమీప భవిష్యత్తులో వర్షం అవకాశం తక్కువ.',
    DELAY_IRRIGATION_RAIN_EXPECTED: 'త్వరలో వర్షం వస్తుందని అంచనా — ఇప్పుడు నీటిపారుదల అవసరం లేకపోవచ్చు.',
    WEATHER_UNAVAILABLE: 'వాతావరణ అంచనా డేటా అందుబాటులో లేదు.',
    BASELINE_CONFIDENCE_LOW: 'మరుడం ఇంకా మీ పొలాన్ని నేర్చుకుంటోంది — బేస్‌లైన్ ఇంకా విశ్వసనీయంగా లేదు.',
    NO_SENSOR_DATA: 'ఇంకా సెన్సార్ డేటా అందలేదు.',
    AWAITING_BASELINE: 'మీ పొలం బేస్‌లైన్ స్థాపించడానికి వేచి ఉంది.',
  },
  events: {
    NEW: 'కొత్తది', ONGOING: 'కొనసాగుతోంది', PERSISTENT: 'నిరంతరం', RESOLVED: 'పరిష్కరించబడింది',
    SOIL_MOISTURE_DROP: 'తేమ తగ్గుదల', SOIL_MOISTURE_SURGE: 'తేమ పెరుగుదల',
    TEMPERATURE_SPIKE: 'ఉష్ణోగ్రత పెరుగుదల', HUMIDITY_DROP: 'తేమ తగ్గుదల',
  },
  risk: {
    NONE: 'ప్రమాదం లేదు', WATER_DEFICIT: 'నీటి కొరత ప్రమాదం', WATERLOGGING: 'నీటి నిలకడ ప్రమాదం',
    HEAT_STRESS: 'వేడి ఒత్తిడి', LOW_LIGHT: 'తక్కువ కాంతి',
    label: 'ప్రమాదం', levelLow: 'తక్కువ', levelModerate: 'మధ్యస్థం', levelHigh: 'ఎక్కువ',
  },
  chat: {
    title: 'మరుడంను అడగండి', askButton: 'మరుడంను అడగండి', placeholder: 'మీ పొలం గురించి అడగండి…',
    usingFieldData: 'మీ పొలం డేటా ఉపయోగిస్తోంది', thinking: 'ఆలోచిస్తోంది…', send: 'పంపు', close: 'మూయండి',
    suggestedTitle: 'మీరు అడగవచ్చు:',
    suggested1: 'నేను ఎందుకు నీటిపారుదల చేయాలి?',
    suggested2: 'ఈరోజు వర్షం అంచనా ఉందా?',
    suggested3: 'నా పొలం ఎందుకు శ్రద్ధ చూపిస్తోంది?',
    suggested4: 'నా పొలంలో సాధారణం కంటే ఏమి వేరుగా ఉంది?',
    suggested5: 'మరుడం నా పొలాన్ని ఎలా నేర్చుకుంటోంది?',
    suggested6: 'నా నేల తేమ విలువ అర్థం ఏమిటి?',
    errorNotConfigured: 'AI సహాయకుడు ఇంకా కాన్ఫిగర్ చేయబడలేదు.',
    errorGeneral: 'ఏదో తప్పు జరిగింది. మళ్ళీ ప్రయత్నించండి.',
    emptyState: 'మీ పొలం గురించి ఏదైనా అడగండి.',
  },
  baseline: {
    scheduleTitle: 'పొలం నేర్చుకోవడం షెడ్యూల్', learning: 'నేర్చుకుంటోంది…', learningComplete: 'నేర్చుకోవడం పూర్తయింది',
    daysRemaining: 'రోజులు మిగిలి ఉన్నాయి', nextReviewDate: 'తదుపరి సమీక్ష',
    reasonStable: 'పరిస్థితులు స్థిరంగా ఉన్నాయి — చిన్న నేర్చుకోవడం కాలం సరిపోవచ్చు.',
    reasonModerate: 'పరిస్థితులు మధ్యస్థంగా మారుతున్నాయి — ప్రామాణిక కాలం ఉపయోగించబడుతోంది.',
    reasonHighVariability: 'వాతావరణం తరచుగా మారుతోంది — తాత్కాలిక పరిస్థితిని సాధారణంగా నేర్చుకోకుండా ఉండటానికి ఎక్కువ కాలం ఉపయోగించబడుతోంది.',
    reasonNewCrop: 'కొత్త పంట లేదా దశ — కొత్త నేర్చుకోవడం కాలం ప్రారంభమవుతోంది.',
    reviewDue: 'బేస్‌లైన్ సమీక్ష సిఫారసు చేయబడింది.', versionLabel: 'బేస్‌లైన్ వెర్షన్',
  },
  onboarding: {
    noDevice: 'సెన్సార్ కనెక్ట్ కాలేదు', noDeviceDesc: 'మీ పొలాన్ని పర్యవేక్షించడం ప్రారంభించడానికి ESP32 సెన్సార్ పరికరాన్ని కనెక్ట్ చేయండి.',
    deviceConnected: 'సెన్సార్ కనెక్ట్ అయింది', setupComplete: 'సెటప్ పూర్తయింది',
    welcomeFarmer: 'మరుడంకు స్వాగతం',
  },
  common: {
    loading: 'లోడ్ అవుతోంది…', error: 'లోపం', retry: 'మళ్ళీ ప్రయత్నించు', save: 'సేవ్', saved: 'సేవ్ అయింది',
    cancel: 'రద్దు', confirm: 'నిర్ధారించు', days: 'రోజులు', hours: 'గంటలు', minutes: 'నిమిషాలు',
    percent: '%', celsius: '°C', lux: 'lux', notAvailable: 'N/A', ago: 'క్రితం', justNow: 'ఇప్పుడే', today: 'నేడు',
  },
};

// =============================================================================
// KANNADA
// =============================================================================
const kn: Translations = {

  settings: {
    title: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    profile: 'ಪ್ರೊಫೈಲ್', farmerName: 'ರೈತನ ಹೆಸರು', farmInfo: 'ಹೊಲದ ಮಾಹಿತಿ', editProfile: 'ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ',
    language: 'ಭಾಷೆ',
    notifications: 'ಅಧಿಸೂಚನೆಗಳು', fieldEvents: 'ಹೊಲದ ಈವೆಂಟ್ ಅಧಿಸೂಚನೆಗಳು', recommendations: 'ಶಿಫಾರಸು ಅಧಿಸೂಚನೆಗಳು', deviceAlerts: 'ಸಾಧನದ ಎಚ್ಚರಿಕೆಗಳು',
    cropAndField: 'ಬೆಳೆ ಮತ್ತು ಹೊಲ', climateZone: 'ಹವಾಮಾನ ವಲಯ', season: 'ಋತು', growthStage: 'ಬೆಳವಣಿಗೆಯ ಹಂತ', sowingDate: 'ಬಿತ್ತನೆ ದಿನಾಂಕ',
    adaptiveBaseline: 'ಹೊಂದಾಣಿಕೆಯ ಬೇಸ್‌ಲೈನ್', learningStatus: 'ಕಲಿಕೆಯ ಸ್ಥಿತಿ', baselineConfidence: 'ಬೇಸ್‌ಲೈನ್ ವಿಶ್ವಾಸ', reviewSchedule: 'ವಿಮರ್ಶೆ ವೇಳಾಪಟ್ಟಿ', baselineExplanation: 'ಮರುದಮ್ ನಿಮ್ಮ ಹೊಲದ ಸಾಮಾನ್ಯ ಪರಿಸ್ಥಿತಿಗಳನ್ನು ನಿರಂತರವಾಗಿ ಕಲಿಯುತ್ತದೆ.',
    device: 'ಸಾಧನ', esp32Status: 'ESP32 ಸಂಪರ್ಕ ಸ್ಥಿತಿ', lastCommunication: 'ಕೊನೆಯ ಸಂವಹನ', sensorStatus: 'ಸಂವೇದಕ ಸಂಪರ್ಕ ಸ್ಥಿತಿ',
    aiAssistant: 'AI ಸಹಾಯಕ', askMarudamStatus: 'ಮರುದಮ್ ಅನ್ನು ಕೇಳಿ ಸ್ಥಿತಿ', configStatus: 'ಕಾನ್ಫಿಗರೇಶನ್ ಸ್ಥಿತಿ', aiNotConfigured: 'AI ಸಹಾಯಕವನ್ನು ಇನ್ನೂ ಕಾನ್ಫಿಗರ್ ಮಾಡಲಾಗಿಲ್ಲ.',
    aboutMarudam: 'ಮರುದಮ್ ಬಗ್ಗೆ', version: 'ಆವೃತ್ತಿ', purpose: 'ಉದ್ದೇಶ',
    save: 'ಉಳಿಸಿ', saving: 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...', savedSuccessfully: 'ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ.', saveFailed: 'ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    notAvailable: 'ಲಭ್ಯವಿಲ್ಲ', waitingForEsp: 'ESP32 ಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ'
  },
  helpCenter: {
    title: 'ಸಹಾಯ ಕೇಂದ್ರ',
    gettingStarted: 'ಪ್ರಾರಂಭಿಸುವಿಕೆ', howItWorks: 'ಮರುದಮ್ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ', readFieldHealth: 'ಹೊಲದ ಆರೋಗ್ಯವನ್ನು ಹೇಗೆ ಓದುವುದು', howSensorsWork: 'ಸಂವೇದಕಗಳು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತವೆ',
    sensors: 'ಸಂವೇದಕಗಳು', soilMoisture: 'ಮಣ್ಣಿನ ತೇವಾಂಶ', soilTemp: 'ಮಣ್ಣಿನ ತಾಪಮಾನ', lightIntensity: 'ಬೆಳಕಿನ ತೀವ್ರತೆ', airHumidity: 'ಗಾಳಿಯ ತೇವಾಂಶ', surroundingTemp: 'ಸುತ್ತಮುತ್ತಲಿನ ತಾಪಮಾನ',
    fieldHealth: 'ಹೊಲದ ಆರೋಗ್ಯ', healthy: 'ಆರೋಗ್ಯಕರ', watch: 'ಗಮನಿಸಿ', attention: 'ಗಮನ ಹರಿಸಿ',
    recommendations: 'ಶಿಫಾರಸುಗಳು', whatRecommendationsMean: 'ಶಿಫಾರಸುಗಳ ಅರ್ಥವೇನು', confidence: 'ವಿಶ್ವಾಸ', urgency: 'ತುರ್ತು',
    adaptiveBaseline: 'ಹೊಂದಾಣಿಕೆಯ ಬೇಸ್‌ಲೈನ್', whatMarudamLearns: 'ಮರುದಮ್ ಏನು ಕಲಿಯುತ್ತದೆ', whyBaselineChanges: 'ಬೇಸ್‌ಲೈನ್ ಏಕೆ ಬದಲಾಗುತ್ತದೆ', whyWeatherAffects: 'ಹವಾಮಾನವು ಕಲಿಕೆಗೆ ಏಕೆ ಪರಿಣಾಮ ಬೀರುತ್ತದೆ',
    esp32: 'ESP32', howToConnect: 'ಸಾಧನವನ್ನು ಹೇಗೆ ಸಂಪರ್ಕಿಸುವುದು', deviceOffline: 'ಸಾಧನ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದಾಗ ಏನಾಗುತ್ತದೆ',
    askMarudam: 'ಮರುದಮ್ ಅನ್ನು ಕೇಳಿ', howToAsk: 'ಪ್ರಶ್ನೆಗಳನ್ನು ಹೇಗೆ ಕೇಳುವುದು', supportedLanguages: 'ಬೆಂಬಲಿತ ಭಾಷೆಗಳು'
  },
  brand: { name: 'ಮರುಡಂ', tagline: 'ನಿಮ್ಮ ಹೊಲವನ್ನು ತಿಳಿಯಿರಿ. ವಿಶ್ವಾಸದಿಂದ ಬೆಳೆಯಿರಿ.' },
  nav: {
    home: 'ಮನೆ', about: 'ನಮ್ಮ ಬಗ್ಗೆ', features: 'ವೈಶಿಷ್ಟ್ಯಗಳು',
    login: 'ಲಾಗಿನ್', register: 'ಖಾತೆ ತೆರೆಯಿರಿ',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', logout: 'ಲಾಗ್ ಔಟ್', myProfile: 'ನನ್ನ ಪ್ರೊಫೈಲ್',
  },
  login: {
    welcome: 'ಮತ್ತೆ ಸ್ವಾಗತ', subtitle: 'ನಿಮ್ಮ ಹೊಲದ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಲಾಗಿನ್ ಆಗಿ',
    email: 'ಇಮೇಲ್ ವಿಳಾಸ', password: 'ಪಾಸ್‌ವರ್ಡ್',
    forgotPassword: 'ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?',
    signIn: 'ಲಾಗಿನ್', signingIn: 'ಲಾಗಿನ್ ಆಗುತ್ತಿದೆ…',
    noAccount: 'ಖಾತೆ ಇಲ್ಲವೆ?', createAccount: 'ಖಾತೆ ತೆರೆಯಿರಿ',
    backToHome: 'ಹಿಂದೆ', errorInvalidCredentials: 'ಇಮೇಲ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್ ತಪ್ಪಾಗಿದೆ.',
    errorGeneral: 'ಲಾಗಿನ್ ವಿಫಲವಾಯಿತು. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    errorEmailRequired: 'ಇಮೇಲ್ ಅಗತ್ಯ.', errorPasswordRequired: 'ಪಾಸ್‌ವರ್ಡ್ ಅಗತ್ಯ.',
  },
  register: {
    title: 'ರೈತ ಖಾತೆ ತೆರೆಯಿರಿ', subtitle: 'ನಿಮ್ಮ ಮರುಡಂ ಹೊಲದ ಪ್ರೊಫೈಲ್ ಹೊಂದಿಸಿ',
    step1Title: 'ಖಾತೆ ವಿವರಗಳು', step2Title: 'ನಿಮ್ಮ ಸ್ಥಳ', step3Title: 'ನಿಮ್ಮ ಬೆಳೆ',
    name: 'ನಿಮ್ಮ ಹೆಸರು', namePlaceholder: 'ಉದಾ. ರವಿ ಕುಮಾರ್',
    email: 'ಇಮೇಲ್ ವಿಳಾಸ', emailPlaceholder: 'you@example.com',
    password: 'ಪಾಸ್‌ವರ್ಡ್', passwordPlaceholder: 'ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳು',
    confirmPassword: 'ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ', confirmPasswordPlaceholder: 'ಪಾಸ್‌ವರ್ಡ್ ಮತ್ತೆ ನಮೂದಿಸಿ',
    language: 'ಆದ್ಯ ಭಾಷೆ', state: 'ರಾಜ್ಯ', district: 'ಜಿಲ್ಲೆ',
    selectState: 'ರಾಜ್ಯ ಆಯ್ಕೆ ಮಾಡಿ', selectDistrict: 'ಜಿಲ್ಲೆ ಆಯ್ಕೆ ಮಾಡಿ',
    crop: 'ಮುಖ್ಯ ಬೆಳೆ', selectCrop: 'ಬೆಳೆ ಆಯ್ಕೆ ಮಾಡಿ',
    sowingDate: 'ಬಿತ್ತನೆ ದಿನಾಂಕ', deviceId: 'ಸಾಧನ ID', deviceIdPlaceholder: 'ಉದಾ. FIELD_001',
    deviceIdOptional: 'ಐಚ್ಛಿಕ — ನಂತರ ಸೇರಿಸಬಹುದು',
    next: 'ಮುಂದೆ', back: 'ಹಿಂದೆ', createAccount: 'ಖಾತೆ ತೆರೆಯಿರಿ', creatingAccount: 'ತೆರೆಯುತ್ತಿದೆ…',
    alreadyHaveAccount: 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?', signIn: 'ಲಾಗಿನ್',
    errorNameRequired: 'ಹೆಸರು ಅಗತ್ಯ.', errorEmailInvalid: 'ಮಾನ್ಯ ಇಮೇಲ್ ನಮೂದಿಸಿ.',
    errorPasswordShort: 'ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳಿರಬೇಕು.',
    errorPasswordMatch: 'ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಾಣಿಕೆ ಆಗಲಿಲ್ಲ.',
    errorStateRequired: 'ರಾಜ್ಯ ಆಯ್ಕೆ ಮಾಡಿ.', errorDistrictRequired: 'ಜಿಲ್ಲೆ ಆಯ್ಕೆ ಮಾಡಿ.',
    errorCropRequired: 'ಬೆಳೆ ಆಯ್ಕೆ ಮಾಡಿ.',
    successMessage: 'ಖಾತೆ ತೆರೆಯಲಾಗಿದೆ! ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗುತ್ತಿದ್ದೇವೆ…',
  },
  dashboard: {
    title: 'ಮರುಡಂ', subtitle: 'ನಿಮ್ಮ ಹೊಲ, ಇಂದು',
    farmerProfile: 'ರೈತ ಪ್ರೊಫೈಲ್', farmerName: 'ರೈತ',
    language: 'ಭಾಷೆ', state: 'ರಾಜ್ಯ', district: 'ಜಿಲ್ಲೆ',
    crop: 'ಬೆಳೆ', sowingDate: 'ಬಿತ್ತನೆ ದಿನಾಂಕ',
    saveProfile: 'ಪ್ರೊಫೈಲ್ ಉಳಿಸಿ', profileSaved: 'ಉಳಿಸಲಾಗಿದೆ!',
    agriculturalContext: 'ಕೃಷಿ ಸಂದರ್ಭ', climateZone: 'ಹವಾಮಾನ ವಲಯ',
    estimatedSeason: 'ಋತು', growthStage: 'ಬೆಳವಣಿಗೆ ಹಂತ',
    regionalConditions: 'ಪ್ರಾದೇಶಿಕ ಪರಿಸ್ಥಿತಿಗಳು', regionalNote: 'ಪ್ರಾದೇಶಿಕ ಮೂಲ ರೇಖೆ',
    fieldLearningActive: 'ಹೊಲದ ಕಲಿಕೆ ಸಕ್ರಿಯ',
    adaptiveBaseline: 'ಹೊಂದಾಣಿಕೆ ಮೂಲ ರೇಖೆ', adaptiveBaselineDesc: 'ಮರುಡಂ ನಿಮ್ಮ ಹೊಲವನ್ನು ಕಲಿಯುತ್ತಿದೆ',
    observations: 'ವೀಕ್ಷಣೆಗಳು', confidence: 'ವಿಶ್ವಾಸಾರ್ಹತೆ',
    confidenceLow: 'ಕಡಿಮೆ', confidenceMedium: 'ನಿರ್ಮಾಣವಾಗುತ್ತಿದೆ', confidenceHigh: 'ಉತ್ತಮ',
    liveFieldConditions: 'ಹೊಲದ ಪರಿಸ್ಥಿತಿಗಳು', withinRange: 'ಸಾಮಾನ್ಯ', belowRange: 'ಸಾಮಾನ್ಯಕ್ಕಿಂತ ಕಡಿಮೆ', aboveRange: 'ಸಾಮಾನ್ಯಕ್ಕಿಂತ ಹೆಚ್ಚು',
    waitingForEsp: 'ಸೆನ್ಸಾರ್ ಡೇಟಾಗಾಗಿ ಕಾಯುತ್ತಿದೆ…', noSensorData: 'ಇನ್ನೂ ಸೆನ್ಸಾರ್ ಡೇಟಾ ಇಲ್ಲ',
    fieldEvents: 'ಹೊಲದ ಘಟನೆಗಳು', noEventsDetected: 'ಅಸಾಧಾರಣ ಘಟನೆಗಳಿಲ್ಲ',
    severity: 'ತೀವ್ರತೆ', duration: 'ಅವಧಿ',
    moreDetails: 'ಹೆಚ್ಚಿನ ವಿವರಗಳು', hideDetails: 'ವಿವರಗಳು ಮರೆಮಾಡಿ', logout: 'ಲಾಗ್ ಔಟ್',
    fieldStatus: 'ಹೊಲದ ಸ್ಥಿತಿ',
    fieldStatusNormal: 'ಸಾಮಾನ್ಯ', fieldStatusWatch: 'ಗಮನಿಸಿ', fieldStatusAttention: 'ಗಮನ ಬೇಕು', fieldStatusUncertain: 'ಅನಿಶ್ಚಿತ',
    recommendationTitle: 'ನಾನು ಏನು ಮಾಡಬೇಕು?', evidenceSuggestsTitle: 'ಏಕೆ?', recommendationAction: 'ಶಿಫಾರಸು ಕ್ರಮ',
    confidence_label: 'ವಿಶ್ವಾಸಾರ್ಹತೆ',
    deviceStatus: 'ಸೆನ್ಸಾರ್ ಸಾಧನ', deviceOnline: 'ಆನ್‌ಲೈನ್', deviceStale: 'ಹಳೆಯದು', deviceOffline: 'ಆಫ್‌ಲೈನ್', deviceUnknown: 'ತಿಳಿದಿಲ್ಲ',
    weatherTitle: 'ಹವಾಮಾನ', rainProbability: 'ಮಳೆ ಸಾಧ್ಯತೆ',
    rainUnlikely: 'ಇಂದು ಮಳೆ ಸಾಧ್ಯತೆ ಕಡಿಮೆ.', rainLikely: 'ಶೀಘ್ರದಲ್ಲಿ ಮಳೆ ಬರಬಹುದು.',
    rainMaybeWait: 'ಮಳೆ ಬರಬಹುದು. ನೀರಾವರಿ ಮೊದಲು ಕಾಯಿರಿ.',
    weatherUnavailable: 'ಹವಾಮಾನ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ.', weatherSimulation: 'ಅನುಕರಣೆ ಹವಾಮಾನ',
    temperature: 'ತಾಪಮಾನ',
    rootZoneTitle: 'ಬೇರು ಮಂಡಲ', rootZoneMoistureLabel: 'ಬೇರಿನ ತೇವಾಂಶ',
    rootZoneLow: 'ಕಡಿಮೆ', rootZoneNormal: 'ಸಾಮಾನ್ಯ', rootZoneHigh: 'ಹೆಚ್ಚು', rootZoneUnknown: 'ತಿಳಿದಿಲ್ಲ',
    rootZoneEstimatedNote: 'ಅಂದಾಜು ಮಾಡಲಾಗಿದೆ — ನೇರವಾಗಿ ಅಳೆಯಲಾಗಿಲ್ಲ',
    sensorSoilMoisture: 'ಮಣ್ಣಿನ ತೇವಾಂಶ', sensorSoilTemperature: 'ಮಣ್ಣಿನ ತಾಪಮಾನ',
    sensorAirHumidity: 'ಗಾಳಿ ತೇವಾಂಶ', sensorSurroundingTemp: 'ಸುತ್ತಮುತ್ತಲ ತಾಪಮಾನ', sensorLight: 'ಬೆಳಕು',
    sensorUsual: 'ನಿಮ್ಮ ಹೊಲದಲ್ಲಿ ಸಾಮಾನ್ಯವಾಗಿ', sensorCurrent: 'ಪ್ರಸ್ತುತ',
    fieldLearning: 'ಹೊಲದ ಕಲಿಕೆ', fieldLearningDesc: 'ಮರುಡಂ ನಿಮ್ಮ ಹೊಲದಲ್ಲಿ ಏನು ಸಾಮಾನ್ಯ ಎಂದು ಕಲಿಯುತ್ತಿದೆ.',
    learningPeriodDays: 'ಕಲಿಕಾ ಅವಧಿ', nextReview: 'ಮುಂದಿನ ಪರಿಶೀಲನೆ', learningReason: 'ಕಾರಣ',
    todayFieldStatus: 'ಇಂದಿನ ಹೊಲದ ಸ್ಥಿತಿ',
    welcomeMorning: 'ಶುಭೋದಯ', welcomeAfternoon: 'ಶುಭ ಮಧ್ಯಾಹ್ನ', welcomeEvening: 'ಶುಭ ಸಂಜೆ',
    monitoringMsg: 'ಮರುದಮ್ {district} ನಲ್ಲಿ ನಿಮ್ಮ {crop} ಹೊಲವನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡುತ್ತಿದೆ.',
    navDashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', navField: 'ಹೊಲ', navSensors: 'ಸಂವೇದಕಗಳು', navInsights: 'ಒಳನೋಟಗಳು',
    plantedLabel: 'ನೆಟ್ಟ ದಿನಾಂಕ', notSet: 'ಹೊಂದಿಸಿಲ್ಲ',
    fieldHealthTitle: 'ಹೊಲದ ಆರೋಗ್ಯ',
    fieldHealthNormalDesc: 'ನಿಮ್ಮ ಹೊಲದ ಸ್ಥಿತಿ ಪ್ರಸ್ತುತ ನಿರೀಕ್ಷಿತ ವ್ಯಾಪ್ತಿಯಲ್ಲಿದೆ.',
    fieldHealthWatchDesc: 'ಕೆಲವು ಪರಿಸ್ಥಿತಿಗಳು ನಿರೀಕ್ಷಿತ ವ್ಯಾಪ್ತಿಯಿಂದ ಸ್ವಲ್ಪ ಹೊರಗಿವೆ. ಎಚ್ಚರಿಕೆಯಿಂದ ಗಮನಿಸಿ.',
    fieldHealthAttentionDesc: 'ತಕ್ಷಣದ ಗಮನ ಅಗತ್ಯವಿರಬಹುದು. ಪರಿಸ್ಥಿತಿಗಳು ಸುರಕ್ಷಿತ ಮಿತಿಗಳನ್ನು ದಾಟಿವೆ.',
    recommendationTitleUpper: 'ಮರುದಮ್ ಶಿಫಾರಸು', reason: 'ಕಾರಣ',
    awaitingData: 'ಶಿಫಾರಸು ಮಾಡಲು ಸಾಕಷ್ಟು ಡೇಟಾಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ.',
    liveSensorsTitle: 'ಲೈವ್ ಫೀಲ್ಡ್ ಸಂವೇದಕಗಳು', updatedLabel: 'ನವೀಕರಿಸಲಾಗಿದೆ',
    waitingEsp32Title: 'ESP32 ಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ', waitingEsp32Desc: 'ನಿಮ್ಮ ಫೀಲ್ಡ್ ಸಾಧನವು ಇತ್ತೀಚೆಗೆ ಸಂಪರ್ಕಗೊಂಡಿಲ್ಲ. ESP32 ಆನ್‌ಲೈನ್ ಬಂದಾಗ ಲೈವ್ ಸಂವೇದಕ ಓದುವಿಕೆಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.',
    expLabel: 'ನಿರೀಕ್ಷಿತ', statusLow: 'ಕಡಿಮೆ', statusHigh: 'ಹೆಚ್ಚು', statusOptimal: 'ಸೂಕ್ತ',
    learningUpper: 'ಮರುದಮ್ ನಿಮ್ಮ ಹೊಲವನ್ನು ಕಲಿಯುತ್ತಿದೆ', learningDescLong: 'ಮರುದಮ್ ಕಾಲಾನಂತರದಲ್ಲಿ ನಿಮ್ಮ ಹೊಲದ ಸಾಮಾನ್ಯ ಪರಿಸ್ಥಿತಿಗಳನ್ನು ಕಲಿಯುತ್ತದೆ ಮತ್ತು ಅಸಾಮಾನ್ಯ ಬದಲಾವಣೆಗಳನ್ನು ನಿಖರವಾಗಿ ಪತ್ತೆಹಚ್ಚಲು ಅವುಗಳನ್ನು ಬಳಸುತ್ತದೆ.',
    readingsCount: 'ಓದುವಿಕೆಗಳು', rangeLabel: 'ವ್ಯಾಪ್ತಿ',
    initialLearningActive: 'ಆರಂಭಿಕ ಕಲಿಕೆಯ ಹಂತವು ಸಕ್ರಿಯವಾಗಿದೆ. ನಿಖರವಾದ ಬೇಸ್‌ಲೈನ್‌ಗಳು ಶೀಘ್ರದಲ್ಲೇ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ.',
    weatherContextTitle: 'ಹವಾಮಾನದ ಸಂದರ್ಭ', howThisAffectsYou: 'ಇದು ನಿಮ್ಮ ಮೇಲೆ ಹೇಗೆ ಪರಿಣಾಮ ಬೀರುತ್ತದೆ',
    weatherHighRainDesc: 'ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆ ಹೆಚ್ಚು. ಸಾಧ್ಯವಾದರೆ ನೀರಾವರಿಯನ್ನು ವಿಳಂಬಗೊಳಿಸಿ.', weatherLowRainDesc: 'ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆ ಕಡಿಮೆ. ಮಣ್ಣಿನ ತೇವಾಂಶವನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ಗಮನಿಸಿ.',
    rootZoneUpperTitle: 'ಮೂಲವಲಯದ ಸ್ಥಿತಿ', rootZoneLowDesc: 'ಮೇಲ್ಮೈ ಕೆಳಗಿನ ತೇವಾಂಶವು ಕಡಿಮೆಯಾಗುವ ಸಾಧ್ಯತೆಯಿದೆ. ಆಳವಾದ ನೀರಾವರಿ ಬೇಕಾಗಬಹುದು.',
    rootZoneHighDesc: 'ಮೇಲ್ಮೈ ಕೆಳಗಿನ ತೇವಾಂಶ ಹೆಚ್ಚಾಗಿದೆ. ಸರಿಯಾದ ಒಳಚರಂಡಿಯನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.', rootZoneNormalDesc: 'ಮೇಲ್ಮೈ ಓದುವಿಕೆಗಳು ಮತ್ತು ಹವಾಮಾನದ ಆಧಾರದ ಮೇಲೆ ಮೂಲವಲಯದ ತೇವಾಂಶವು ಸಾಕಷ್ಟು ತೋರುತ್ತಿದೆ.',
    aiEstimated: 'AI ಅಂದಾಜು', waitingRootZone: 'ಮೂಲವಲಯವನ್ನು ಅಂದಾಜು ಮಾಡಲು ಸಾಕಷ್ಟು ಡೇಟಾಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ.',
    fieldEventsUpper: 'ಹೊಲದ ಘಟನೆಗಳು', noUnusualEvents: 'ಇತ್ತೀಚೆಗೆ ಯಾವುದೇ ಅಸಾಮಾನ್ಯ ಘಟನೆಗಳು ಪತ್ತೆಯಾಗಿಲ್ಲ.',
    durationMins: 'ನಿಮಿಷಗಳ ಅವಧಿ', severityLabel: 'ತೀವ್ರತೆ',
    sensorDetailsTitle: 'ಸಂವೇದಕ ವಿವರಗಳು', sensorDetailsDesc: 'ಮರುದಮ್ ಹೆಚ್ಚಿನ ಡೇಟಾವನ್ನು ಸಂಗ್ರಹಿಸಿದ ನಂತರ ಐತಿಹಾಸಿಕ ಓದುವಿಕೆಗಳು ಮತ್ತು ವಿವರವಾದ ಪ್ರವೃತ್ತಿಗಳು ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ.',
 whatShouldIDo: 'ನಾನು ಏನು ಮಾಡಬೇಕು?', why: 'ಏಕೆ?', fieldConditions: 'ಹೊಲದ ಪರಿಸ್ಥಿತಿಗಳು',

  },
  recommendation: {
    MONITOR: 'ನಿಮ್ಮ ಹೊಲ ಸಾಮಾನ್ಯವಾಗಿ ಕಾಣುತ್ತಿದೆ. ನಿಯಮಿತವಾಗಿ ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ.',
    CONSIDER_IRRIGATION: 'ನಿಮ್ಮ ಹೊಲ ಸಾಮಾನ್ಯಕ್ಕಿಂತ ಒಣಗಿದೆ ಮತ್ತು ಮಳೆ ಸಾಧ್ಯತೆ ಕಡಿಮೆ. ಹೊಲ ಪರೀಕ್ಷಿಸಿ ನೀರಾವರಿ ಪರಿಗಣಿಸಿ.',
    WAIT_FOR_RAIN: 'ಹೊಲ ಒಣಗಿದೆ ಆದರೆ ಶೀಘ್ರದಲ್ಲಿ ಮಳೆ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ. ಮಳೆ ನಂತರ ಮತ್ತೆ ಪರೀಕ್ಷಿಸಿ.',
    CHECK_FIELD: 'ಹೊಲಕ್ಕೆ ಹೋಗಿ ಮಣ್ಣಿನ ಸ್ಥಿತಿಯನ್ನು ನೇರವಾಗಿ ಪರಿಶೀಲಿಸಿ.',
    REDUCE_WATER: 'ನಿಮ್ಮ ಹೊಲದಲ್ಲಿ ಸಾಮಾನ್ಯಕ್ಕಿಂತ ಹೆಚ್ಚು ತೇವಾಂಶ ಇದೆ. ಈಗ ನೀರಾವರಿ ಕಡಿಮೆ ಮಾಡಿ.',
  },
  evidence: {
    MOISTURE_DROP_PERSISTENT: 'ಮಣ್ಣಿನ ತೇವಾಂಶ ದೀರ್ಘ ಕಾಲ ಸಾಮಾನ್ಯಕ್ಕಿಂತ ಕಡಿಮೆ ಇದೆ.',
    MOISTURE_DROP_RECENT: 'ಮಣ್ಣಿನ ತೇವಾಂಶ ಇತ್ತೀಚೆಗೆ ಸಾಮಾನ್ಯಕ್ಕಿಂತ ಕಡಿಮೆಯಾಗಿದೆ.',
    MOISTURE_BELOW_BASELINE: 'ಮಣ್ಣಿನ ತೇವಾಂಶ ನಿಮ್ಮ ಹೊಲದ ಸಾಮಾನ್ಯ ವ್ಯಾಪ್ತಿಗಿಂತ ಕಡಿಮೆ.',
    MOISTURE_ABOVE_BASELINE: 'ಮಣ್ಣಿನ ತೇವಾಂಶ ನಿಮ್ಮ ಹೊಲದ ಸಾಮಾನ್ಯ ವ್ಯಾಪ್ತಿಗಿಂತ ಹೆಚ್ಚು.',
    ROOT_ZONE_MOISTURE_LOW: 'ಬೇರಿನ ಮಂಡಲ ತೇವಾಂಶ ಕಡಿಮೆ ಎಂದು ಅಂದಾಜಿಸಲಾಗಿದೆ.',
    HIGH_SURROUNDING_TEMPERATURE: 'ಸುತ್ತಮುತ್ತಲ ತಾಪಮಾನ ಹೆಚ್ಚಾಗಿದ್ದು ನೀರಿನ ಆವಿಯಾಗುವಿಕೆ ಹೆಚ್ಚಾಗುತ್ತದೆ.',
    LOW_AIR_HUMIDITY: 'ಗಾಳಿ ತೇವಾಂಶ ಕಡಿಮೆ, ಆವಿಯಾಗುವಿಕೆ ಹೆಚ್ಚಾಗಿದೆ.',
    HIGH_RAIN_PROBABILITY: 'ಹತ್ತಿರದ ಭವಿಷ್ಯದಲ್ಲಿ ಮಳೆ ಬರುವ ಸಾಧ್ಯತೆ ಇದೆ.',
    LOW_RAIN_PROBABILITY: 'ಹತ್ತಿರದ ಭವಿಷ್ಯದಲ್ಲಿ ಮಳೆ ಸಾಧ್ಯತೆ ಕಡಿಮೆ.',
    DELAY_IRRIGATION_RAIN_EXPECTED: 'ಶೀಘ್ರದಲ್ಲಿ ಮಳೆ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ — ಈಗ ನೀರಾವರಿ ಅಗತ್ಯವಿಲ್ಲ.',
    WEATHER_UNAVAILABLE: 'ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ.',
    BASELINE_CONFIDENCE_LOW: 'ಮರುಡಂ ಇನ್ನೂ ನಿಮ್ಮ ಹೊಲ ಕಲಿಯುತ್ತಿದೆ — ಮೂಲ ರೇಖೆ ಇನ್ನೂ ವಿಶ್ವಾಸಾರ್ಹ ಆಗಿಲ್ಲ.',
    NO_SENSOR_DATA: 'ಇನ್ನೂ ಸೆನ್ಸಾರ್ ಡೇಟಾ ಸ್ವೀಕರಿಸಿಲ್ಲ.',
    AWAITING_BASELINE: 'ನಿಮ್ಮ ಹೊಲದ ಮೂಲ ರೇಖೆ ಸ್ಥಾಪಿಸಲು ಕಾಯುತ್ತಿದ್ದೇವೆ.',
  },
  events: {
    NEW: 'ಹೊಸದು', ONGOING: 'ಮುಂದುವರೆಯುತ್ತಿದೆ', PERSISTENT: 'ನಿರಂತರ', RESOLVED: 'ಪರಿಹರಿಸಲಾಗಿದೆ',
    SOIL_MOISTURE_DROP: 'ತೇವಾಂಶ ಕಡಿಮೆ', SOIL_MOISTURE_SURGE: 'ತೇವಾಂಶ ಹೆಚ್ಚಳ',
    TEMPERATURE_SPIKE: 'ತಾಪಮಾನ ಏರಿಕೆ', HUMIDITY_DROP: 'ಆರ್ದ್ರತೆ ಕಡಿಮೆ',
  },
  risk: {
    NONE: 'ಅಪಾಯ ಇಲ್ಲ', WATER_DEFICIT: 'ನೀರಿನ ಕೊರತೆ ಅಪಾಯ', WATERLOGGING: 'ನೀರು ನಿಲ್ಲುವ ಅಪಾಯ',
    HEAT_STRESS: 'ಶಾಖ ಒತ್ತಡ', LOW_LIGHT: 'ಕಡಿಮೆ ಬೆಳಕು',
    label: 'ಅಪಾಯ', levelLow: 'ಕಡಿಮೆ', levelModerate: 'ಮಧ್ಯಮ', levelHigh: 'ಹೆಚ್ಚು',
  },
  chat: {
    title: 'ಮರುಡಂ ಕೇಳಿ', askButton: 'ಮರುಡಂ ಕೇಳಿ', placeholder: 'ನಿಮ್ಮ ಹೊಲದ ಬಗ್ಗೆ ಕೇಳಿ…',
    usingFieldData: 'ನಿಮ್ಮ ಹೊಲದ ಡೇಟಾ ಬಳಸುತ್ತಿದೆ', thinking: 'ಯೋಚಿಸುತ್ತಿದೆ…', send: 'ಕಳಿಸಿ', close: 'ಮುಚ್ಚಿ',
    suggestedTitle: 'ನೀವು ಕೇಳಬಹುದು:',
    suggested1: 'ನಾನು ಏಕೆ ನೀರಾವರಿ ಮಾಡಬೇಕು?',
    suggested2: 'ಇಂದು ಮಳೆ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆಯೇ?',
    suggested3: 'ನನ್ನ ಹೊಲ ಏಕೆ ಗಮನ ಬೇಕು ತೋರಿಸುತ್ತಿದೆ?',
    suggested4: 'ನನ್ನ ಹೊಲದಲ್ಲಿ ಸಾಮಾನ್ಯಕ್ಕಿಂತ ಏನು ವ್ಯತ್ಯಾಸ ಇದೆ?',
    suggested5: 'ಮರುಡಂ ನನ್ನ ಹೊಲ ಹೇಗೆ ಕಲಿಯುತ್ತಿದೆ?',
    suggested6: 'ನನ್ನ ಮಣ್ಣಿನ ತೇವಾಂಶ ಮೌಲ್ಯ ಅರ್ಥ ಏನು?',
    errorNotConfigured: 'AI ಸಹಾಯಕ ಇನ್ನೂ ಕಾನ್ಫಿಗರ್ ಆಗಿಲ್ಲ.',
    errorGeneral: 'ಏನೋ ತಪ್ಪಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    emptyState: 'ನಿಮ್ಮ ಹೊಲದ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ.',
  },
  baseline: {
    scheduleTitle: 'ಹೊಲ ಕಲಿಕಾ ವೇಳಾಪಟ್ಟಿ', learning: 'ಕಲಿಯುತ್ತಿದೆ…', learningComplete: 'ಕಲಿಕೆ ಮುಗಿದಿದೆ',
    daysRemaining: 'ದಿನಗಳು ಉಳಿದಿವೆ', nextReviewDate: 'ಮುಂದಿನ ಪರಿಶೀಲನೆ',
    reasonStable: 'ಪರಿಸ್ಥಿತಿಗಳು ಸ್ಥಿರ — ಚಿಕ್ಕ ಕಲಿಕಾ ಅವಧಿ ಸಾಕಾಗಬಹುದು.',
    reasonModerate: 'ಪರಿಸ್ಥಿತಿಗಳು ಮಧ್ಯಮ ಬದಲಾವಣೆ — ಪ್ರಮಾಣಿತ ಅವಧಿ ಬಳಸಲಾಗುತ್ತಿದೆ.',
    reasonHighVariability: 'ಹವಾಮಾನ ಆಗಾಗ ಬದಲಾಗುತ್ತಿದೆ — ತಾತ್ಕಾಲಿಕ ಸ್ಥಿತಿಯನ್ನು ಸಾಮಾನ್ಯ ಎಂದು ಕಲಿಯದಿರಲು ದೀರ್ಘ ಅವಧಿ ಬಳಸಲಾಗುತ್ತಿದೆ.',
    reasonNewCrop: 'ಹೊಸ ಬೆಳೆ ಅಥವಾ ಹಂತ — ಹೊಸ ಕಲಿಕಾ ಅವಧಿ ಪ್ರಾರಂಭ.',
    reviewDue: 'ಮೂಲ ರೇಖೆ ಪರಿಶೀಲನೆ ಶಿಫಾರಸು.', versionLabel: 'ಮೂಲ ರೇಖೆ ಆವೃತ್ತಿ',
  },
  onboarding: {
    noDevice: 'ಸೆನ್ಸಾರ್ ಸಂಪರ್ಕಿಸಿಲ್ಲ', noDeviceDesc: 'ನಿಮ್ಮ ಹೊಲ ಮೇಲ್ವಿಚಾರಣೆ ಪ್ರಾರಂಭಿಸಲು ESP32 ಸೆನ್ಸಾರ್ ಸಾಧನ ಸಂಪರ್ಕಿಸಿ.',
    deviceConnected: 'ಸೆನ್ಸಾರ್ ಸಂಪರ್ಕಿಸಲಾಗಿದೆ', setupComplete: 'ಸೆಟಪ್ ಮುಗಿದಿದೆ',
    welcomeFarmer: 'ಮರುಡಂಗೆ ಸ್ವಾಗತ',
  },
  common: {
    loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ…', error: 'ದೋಷ', retry: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ', save: 'ಉಳಿಸಿ', saved: 'ಉಳಿಸಲಾಗಿದೆ',
    cancel: 'ರದ್ದು', confirm: 'ದೃಢೀಕರಿಸಿ', days: 'ದಿನಗಳು', hours: 'ಗಂಟೆ', minutes: 'ನಿಮಿಷ',
    percent: '%', celsius: '°C', lux: 'lux', notAvailable: 'N/A', ago: 'ಹಿಂದೆ', justNow: 'ಈಗ', today: 'ಇಂದು',
  },
};

// =============================================================================
// RESOLUTION
// =============================================================================
const TRANSLATIONS: Record<Language, Translations> = { English: en, Hindi: hi, Tamil: ta, Telugu: te, Kannada: kn };

export function getTranslations(language: Language): Translations {
  return TRANSLATIONS[language] ?? TRANSLATIONS.English;
}

// ─── Helper: translate evidence codes to farmer-friendly sentences ────────────
export function translateEvidence(code: string, language: Language, value?: number): string {
  const t = getTranslations(language);
  const baseText = t.evidence[code as keyof typeof t.evidence];
  if (!baseText) return code;
  if (value !== undefined && !isNaN(value)) {
    return `${baseText} (${value.toFixed(1)}%)`;
  }
  return baseText;
}

// ─── Helper: translate event type codes ──────────────────────────────────────
export function translateEvent(code: string, language: Language): string {
  const t = getTranslations(language);
  return t.events[code as keyof typeof t.events] ?? code;
}

// ─── Helper: translate recommendation action to full farmer sentence ──────────
export function translateRecommendation(action: string, language: Language): string {
  const t = getTranslations(language);
  return t.recommendation[action as keyof typeof t.recommendation] ?? action;
}
