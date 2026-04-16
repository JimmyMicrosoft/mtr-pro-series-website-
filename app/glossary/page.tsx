import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Glossary',
  description: 'Definitions of key Microsoft Teams Rooms and AV integration terms.',
}

// Initial 50 priority terms — expand as full glossary entries are authored
const terms = [
  { term: 'AEC', slug: 'aec', short: 'Acoustic Echo Cancellation — removes loudspeaker audio from microphone input.' },
  { term: 'AGC', slug: 'agc', short: 'Automatic Gain Control — normalizes microphone level for consistent volume.' },
  { term: 'Certified Device', slug: 'certified-device', short: 'Hardware verified by Microsoft to meet Teams Rooms performance requirements.' },
  { term: 'CQD', slug: 'cqd', short: 'Call Quality Dashboard — Microsoft tool for analyzing Teams call quality metrics at scale.' },
  { term: 'DSCP', slug: 'dscp', short: 'Differentiated Services Code Point — QoS marking in IP packet headers.' },
  { term: 'DSP', slug: 'dsp', short: 'Digital Signal Processor — hardware or software that processes audio signals.' },
  { term: 'Exchange Online', slug: 'exchange-online', short: 'Microsoft\'s cloud-hosted email and calendar service; hosts MTR resource account mailboxes.' },
  { term: 'Front Row', slug: 'front-row', short: 'MTR display layout placing remote participants in a persistent strip at screen bottom.' },
  { term: 'Graph API', slug: 'graph-api', short: 'Microsoft REST API providing programmatic access to M365 services including MTR devices.' },
  { term: 'HDBaseT', slug: 'hdbaset', short: 'Technology for transmitting HD video, audio, power, and data over Cat5e/6 up to 100m.' },
  { term: 'Intune', slug: 'intune', short: 'Microsoft Endpoint Manager / Intune — cloud-based device management for Windows and Android.' },
  { term: 'MTR Android', slug: 'mtr-android', short: 'Microsoft Teams Rooms running on Android OS — typically bar-form-factor devices.' },
  { term: 'MTR Windows', slug: 'mtr-windows', short: 'Microsoft Teams Rooms running on Windows 10/11 IoT Enterprise.' },
  { term: 'MTR Pro Management', slug: 'mtr-pro-management', short: 'Microsoft\'s cloud portal for monitoring and managing MTR devices at scale.' },
  { term: 'NLP', slug: 'nlp', short: 'Non-Linear Processing — residual echo suppressor applied after AEC.' },
  { term: 'OOBE', slug: 'oobe', short: 'Out-of-Box Experience — the first-boot setup wizard on a new MTR device.' },
  { term: 'PoE', slug: 'poe', short: 'Power over Ethernet — delivers DC power via Cat cable; used for MTR touch consoles.' },
  { term: 'PTZ Camera', slug: 'ptz-camera', short: 'Pan-Tilt-Zoom camera — motorized camera controllable for preset framing.' },
  { term: 'QoS', slug: 'qos', short: 'Quality of Service — network traffic prioritization ensuring real-time media gets priority.' },
  { term: 'Resource Account', slug: 'resource-account', short: 'The M365 account that an MTR device uses to sign in and receive meeting invitations.' },
  { term: 'RT60', slug: 'rt60', short: 'Reverberation Time — how long sound takes to decay 60 dB; key acoustic metric for conference rooms.' },
  { term: 'SkypeSettings.xml', slug: 'skype-settings-xml', short: 'XML configuration file that pre-configures MTR Windows app settings.' },
  { term: 'STI', slug: 'sti', short: 'Speech Transmission Index — objective measure of speech intelligibility (0–1 scale).' },
  { term: 'TAC', slug: 'tac', short: 'Teams Admin Center — Microsoft admin portal for managing Teams policies and devices.' },
  { term: 'T568B', slug: 't568b', short: 'The most common Ethernet cable wiring standard for RJ45 terminations.' },
  { term: 'VLAN', slug: 'vlan', short: 'Virtual Local Area Network — logical network segmentation within a physical switch.' },
]

// Group by first letter
const grouped = terms.reduce<Record<string, typeof terms>>((acc, t) => {
  const letter = t.term[0].toUpperCase()
  if (!acc[letter]) acc[letter] = []
  acc[letter].push(t)
  return acc
}, {})

const letters = Object.keys(grouped).sort()

export default function GlossaryPage() {
  return (
    <div className="container-content py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Glossary</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Key terms for Microsoft Teams Rooms and AV integration professionals.
        </p>
      </div>

      {/* Letter jump links */}
      <div className="flex flex-wrap gap-1.5 mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-700">
        {letters.map((l) => (
          <a
            key={l}
            href={`#${l}`}
            className="flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-primary-100 hover:text-primary-700 dark:hover:bg-primary-900/30 dark:hover:text-primary-300 transition-colors"
          >
            {l}
          </a>
        ))}
      </div>

      {/* Term list */}
      <div className="space-y-10">
        {letters.map((letter) => (
          <div key={letter} id={letter}>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 pb-2 border-b border-neutral-200 dark:border-neutral-700">
              {letter}
            </h2>
            <dl className="space-y-4">
              {grouped[letter].map((t) => (
                <div key={t.slug} className="flex gap-4">
                  <dt className="w-40 flex-shrink-0">
                    <Link
                      href={`/glossary/${t.slug}`}
                      className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      {t.term}
                    </Link>
                  </dt>
                  <dd className="text-sm text-neutral-600 dark:text-neutral-400 flex-1">
                    {t.short}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  )
}
