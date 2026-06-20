export type Profile = {
  name: string
  slug: string
  path: string
  description: string
  cliProfile: boolean
  active?: boolean
  /** Optional TaskBoardAI board id used for per-project board deep-links. */
  boardId?: string
}

export type UpdateProfileInput = {
  slug: string
  name: string
  description: string
  location: string
  boardId?: string
}

export type ServiceStatus = 'online' | 'offline' | 'checking'

export type Service = {
  id: string
  label: string
  port?: string
  status: ServiceStatus
}

export type CreateProfileInput = {
  name: string
  description: string
  location: string
}

export type AdoptProfileInput = {
  location: string
  name: string
  description: string
}

export type ActionResult = {
  ok: boolean
  message: string
}

export type MonitoredService = {
  id: string
  name: string
  host: string
  port?: number
  enabled: boolean
}

export type Settings = {
  general: {
    defaultLocation: string
    defaultModel: 'vader-3-flash' | 'vader-3.5-flash'
    descriptionTemplate: string
    autoLaunchOnSwitch: boolean
    confirmBeforeSwitch: boolean
    switchBehavior: 'close' | 'keep'
    autoSyncCliOnSwitch: boolean
  }
  appearance: {
    theme: 'dark' | 'light' | 'system'
    accentColor: string
    activeColor: 'green' | 'gold'
    backgroundColor: string
    backgroundBrightness: number
    backgroundImage: string
    backgroundImageBlur: number
    backgroundImageBrightness: number
    backgroundOverlayColor: string
    backgroundOverlayOpacity: number
    backgroundImageVignette: number
    accentIntensity: 'subtle' | 'medium' | 'bold'
    glassIntensity: 'low' | 'medium' | 'high'
    filmGrain: boolean
    vignette: boolean
    wordmarkGlow: boolean
    showMonograms: boolean
    showCliStatus: boolean
    compact: boolean
    animationSpeed: 'full' | 'reduced' | 'off'
    font: 'geist' | 'space-grotesk'
  }
  console: {
    showFooter: boolean
    waveformAnimation: boolean
    waveformColor: 'gold' | 'white' | 'gradient'
    pollIntervalMs: 2000 | 5000 | 10000 | 30000
    showPorts: boolean
    capsuleStyle: 'pill' | 'rounded' | 'minimal'
    services: MonitoredService[]
  }
  shortcuts: Record<string, string>
  integrations: {
    hermesPath: string
    cursorPath: string
    executionPolicy: 'Bypass' | 'RemoteSigned' | 'AllSigned'
    templateSource: string
    switcherScript: string
    openFoldersWith: 'explorer' | 'wt'
    syncOnLaunch: boolean
  }
  data: {
    registryPath: string
    activeProfileFile: string
    mem0Path: string
    apiPort: number
  }
  advanced: {
    dryRun: boolean
    confirmDestructive: boolean
    verboseLogging: boolean
    bindAddress: string
  }
}
