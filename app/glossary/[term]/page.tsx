import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BookOpen, ExternalLink } from 'lucide-react'

interface GlossaryEntry {
  slug: string
  term: string
  definition: string
  category: string
  relatedTerms?: string[]
  relatedLessons?: { title: string; href: string }[]
  source?: string
}

const GLOSSARY: Record<string, GlossaryEntry> = {
  'mtr': {
    slug: 'mtr',
    term: 'MTR (Microsoft Teams Rooms)',
    definition: 'A purpose-built hardware and software solution from Microsoft that turns any meeting room into a Microsoft Teams-enabled space. MTR combines certified hardware (compute, audio, video, display) with a dedicated Windows or Android application that provides a consistent Teams meeting experience from any room.',
    category: 'Platform',
    relatedTerms: ['mtr-windows', 'mtr-android', 'resource-account', 'mtr-pro-license'],
    relatedLessons: [
      { title: 'What is MTR?', href: '/programs/mtr-foundations/tracks/mtr-ecosystem/modules/introduction-to-teams-rooms/lessons/what-is-mtr' },
      { title: 'MTR Windows vs. MTR Android', href: '/programs/mtr-foundations/tracks/mtr-ecosystem/modules/introduction-to-teams-rooms/lessons/mtr-windows-vs-android' },
    ],
  },
  'resource-account': {
    slug: 'resource-account',
    term: 'Resource Account',
    definition: 'A special type of Microsoft 365 account assigned to a shared device or room rather than an individual person. An MTR resource account is a room mailbox that enables the device to receive calendar invitations, join meetings automatically, and appear as a bookable room in Exchange/Outlook. It requires an MTR Basic or MTR Pro license.',
    category: 'Microsoft 365',
    relatedTerms: ['mtr-pro-license', 'room-mailbox', 'calendar-processing', 'exchange-online'],
    relatedLessons: [
      { title: 'Resource Accounts Explained', href: '/programs/mtr-foundations/tracks/mtr-ecosystem/modules/ms-teams-fundamentals/lessons/resource-accounts-explained' },
      { title: 'Resource Account Management', href: '/programs/mtr-systems-integration/tracks/microsoft-365-administration/modules/resource-account-management/lessons/m365-admin-center-creation' },
    ],
  },
  'mtr-pro-license': {
    slug: 'mtr-pro-license',
    term: 'MTR Pro License',
    definition: 'A Microsoft-issued per-room subscription license that enables advanced management, monitoring, and AI-powered features for Microsoft Teams Rooms devices. MTR Pro includes access to the MTR Pro Management portal, automated health alerts, incident management, and AI features like Intelligent Speaker and front-row layout. The basic tier (MTR Basic, included free up to 25 rooms) provides core meeting functionality without management features.',
    category: 'Licensing',
    relatedTerms: ['resource-account', 'mtr-pro-management', 'e3-e5-license'],
    relatedLessons: [
      { title: 'MTR Licensing Deep Dive', href: '/programs/mtr-foundations/tracks/mtr-ecosystem/modules/introduction-to-teams-rooms/lessons/mtr-licensing' },
    ],
  },
  'mtr-pro-management': {
    slug: 'mtr-pro-management',
    term: 'MTR Pro Management (MTRP)',
    definition: 'The cloud-based management portal (formerly Microsoft Teams Rooms Managed Services) that provides centralized monitoring, health dashboards, automated incident creation, remote diagnostics, and multi-tenant partner management for MTR devices. Requires the MTR Pro license per device.',
    category: 'Management',
    relatedTerms: ['mtr-pro-license', 'incident-management', 'multi-tenant-partner'],
    relatedLessons: [
      { title: 'MTR Pro Management Portal', href: '/programs/mtr-advanced-deployment/tracks/enterprise-configuration-management/modules/mtr-pro-management-portal/lessons/portal-onboarding' },
    ],
  },
  'skypesettings-xml': {
    slug: 'skypesettings-xml',
    term: 'SkypeSettings.xml',
    definition: 'An XML configuration file used to customise the behaviour of MTR Windows devices. Placed in a specific directory on the MTR compute unit, it allows administrators to set device defaults such as display configuration, camera defaults, Bluetooth settings, meeting join behaviours, and UI options — without requiring manual configuration through the settings menu. Commonly deployed via Intune or USB provisioning.',
    category: 'Configuration',
    relatedTerms: ['mtr-windows', 'intune', 'xml-config-profile'],
    relatedLessons: [
      { title: 'XML Configuration Profiles', href: '/programs/mtr-foundations/tracks/device-configuration-essentials/modules/xml-configuration-profiles/lessons/skypesettings-schema' },
    ],
  },
  'dscp': {
    slug: 'dscp',
    term: 'DSCP (Differentiated Services Code Point)',
    definition: 'A field in the IP packet header used to classify and prioritise network traffic. Microsoft Teams (including MTR) uses DSCP markings to ensure audio, video, and screen sharing traffic receive appropriate Quality of Service (QoS) treatment through network infrastructure. Standard Teams DSCP values: Audio = EF (46), Video = AF41 (34), Application Sharing = AF21 (18).',
    category: 'Networking',
    relatedTerms: ['qos', 'vlan', 'teams-network-assessment'],
    relatedLessons: [
      { title: 'QoS for Teams Rooms', href: '/programs/mtr-systems-integration/tracks/network-infrastructure/modules/qos-for-teams-rooms/lessons/dscp-markings' },
    ],
  },
  'qos': {
    slug: 'qos',
    term: 'QoS (Quality of Service)',
    definition: 'Network mechanisms that prioritise certain types of traffic over others to ensure consistent performance for real-time applications like voice and video. For MTR deployments, QoS is typically implemented using DSCP markings at the endpoint combined with queue policies on network infrastructure (switches, routers). Without QoS, MTR audio and video quality may degrade during periods of network congestion.',
    category: 'Networking',
    relatedTerms: ['dscp', 'vlan', 'bandwidth-planning'],
    relatedLessons: [
      { title: 'QoS for Teams Rooms', href: '/programs/mtr-systems-integration/tracks/network-infrastructure/modules/qos-for-teams-rooms/lessons/qos-implementation-lab' },
    ],
  },
  'hdbaset': {
    slug: 'hdbaset',
    term: 'HDBaseT',
    definition: 'A connectivity standard that transmits uncompressed HDMI video, audio, power (PoH), USB, IR, and RS-232 control signals over a single Cat5e/Cat6 cable to distances up to 100 metres. Widely used in AV integration to extend display connections from MTR compute units to room displays while reducing cabling complexity. HDBT transmitters and receivers must be matched in spec (e.g., both supporting HDMI 2.0 / 4K/60).',
    category: 'Cabling & Connectivity',
    relatedTerms: ['hdmi', 'usb-extension', 'catx-cable'],
    relatedLessons: [
      { title: 'Distance Limitations & Extenders', href: '/programs/mtr-foundations/tracks/physical-installation/modules/cable-infrastructure/lessons/distance-limitations-extenders' },
    ],
  },
  'aec': {
    slug: 'aec',
    term: 'AEC (Acoustic Echo Cancellation)',
    definition: 'A digital signal processing technique that removes the loudspeaker output from the microphone signal, preventing remote participants from hearing a delayed echo of their own voice. AEC is a critical component of any conference audio system. In MTR deployments, AEC is typically handled either by the certified USB audio device, an external DSP, or in software by Teams itself. Configuration quality significantly affects perceived audio quality.',
    category: 'Audio',
    relatedTerms: ['nlp', 'agc', 'dsp', 'echo-return-loss'],
    relatedLessons: [
      { title: 'DSP Fundamentals', href: '/programs/mtr-systems-integration/tracks/av-systems-commissioning/modules/audio-systems-configuration/lessons/dsp-fundamentals' },
    ],
  },
  'cqd': {
    slug: 'cqd',
    term: 'CQD (Call Quality Dashboard)',
    definition: 'A Microsoft analytics tool within Teams Admin Center that provides aggregated call quality data across an organisation\'s Teams usage. CQD allows administrators to identify systemic quality issues by building reports filtered by network subnet, device type, meeting room location, or time period. For MTR deployments, CQD is the primary tool for identifying network-related call quality issues across a fleet.',
    category: 'Diagnostics',
    relatedTerms: ['tac', 'network-assessment', 'per-call-diagnostics'],
    relatedLessons: [
      { title: 'CQD Systemic Analysis', href: '/programs/mtr-advanced-deployment/tracks/troubleshooting-diagnostics/modules/advanced-diagnostics/lessons/cqd-systemic-analysis' },
    ],
  },
  'oobe': {
    slug: 'oobe',
    term: 'OOBE (Out-of-Box Experience)',
    definition: 'The initial setup process that runs when an MTR device is powered on for the first time. During OOBE, the technician (or automated provisioning process) signs in with the resource account credentials, accepts the licence agreement, and configures initial device settings. For MTR Windows, OOBE launches the Skype Room System app setup wizard. For MTR Android, OOBE varies by OEM vendor.',
    category: 'Configuration',
    relatedTerms: ['resource-account', 'mtr-windows', 'mtr-android', 'skypesettings-xml'],
    relatedLessons: [
      { title: 'MTR Windows — OOBE Walkthrough', href: '/programs/mtr-foundations/tracks/device-configuration-essentials/modules/mtr-windows-initial-setup/lessons/oobe-walkthrough' },
    ],
  },
  'intune': {
    slug: 'intune',
    term: 'Intune (Microsoft Intune)',
    definition: 'Microsoft\'s cloud-based endpoint management solution, part of Microsoft Endpoint Manager. For MTR Windows devices, Intune enables centralized enrollment, compliance policy enforcement, configuration profile deployment (including SkypeSettings.xml), conditional access integration, and remote wipe. MTR Android devices can also be managed via Intune using Android Enterprise device owner mode.',
    category: 'Management',
    relatedTerms: ['mdm', 'skypesettings-xml', 'conditional-access', 'azure-ad-join'],
    relatedLessons: [
      { title: 'Intune and Endpoint Management for MTR', href: '/programs/mtr-advanced-deployment/tracks/enterprise-configuration-management/modules/intune-endpoint-management/lessons/intune-enrollment' },
    ],
  },
  'mtr-windows': {
    slug: 'mtr-windows',
    term: 'MTR Windows',
    definition: 'The Microsoft Teams Rooms application running on a dedicated Windows 10 IoT Enterprise (or Windows 11 IoT Enterprise) compute unit. MTR Windows provides the broadest feature set, including full front-row layout support, Intelligent Speaker, and the widest hardware certification ecosystem. The underlying Windows OS is locked down and managed exclusively through the Teams Rooms app and administrative settings.',
    category: 'Platform',
    relatedTerms: ['mtr', 'mtr-android', 'skypesettings-xml', 'compute-unit'],
    relatedLessons: [
      { title: 'MTR Windows vs. MTR Android', href: '/programs/mtr-foundations/tracks/mtr-ecosystem/modules/introduction-to-teams-rooms/lessons/mtr-windows-vs-android' },
    ],
  },
  'mtr-android': {
    slug: 'mtr-android',
    term: 'MTR Android',
    definition: 'A variant of Microsoft Teams Rooms that runs natively on Android-based devices (e.g., Poly Studio X series, Yealink panels). MTR Android offers a lower total hardware cost and simplified deployment (no separate compute unit) but has a smaller feature set compared to MTR Windows. Configuration is device-dependent, with each OEM providing its own admin interface alongside Teams-level settings.',
    category: 'Platform',
    relatedTerms: ['mtr', 'mtr-windows', 'oem-admin-interface'],
    relatedLessons: [
      { title: 'MTR Android — OOBE Walkthrough', href: '/programs/mtr-foundations/tracks/device-configuration-essentials/modules/mtr-android-initial-setup/lessons/android-oobe-walkthrough' },
    ],
  },
  'vlan': {
    slug: 'vlan',
    term: 'VLAN (Virtual Local Area Network)',
    definition: 'A logical segmentation of a physical network that groups devices into separate broadcast domains regardless of physical location. MTR deployments commonly place devices on a dedicated AV VLAN separate from the general corporate network, allowing specific QoS policies, firewall rules, and DHCP options (NTP server, DNS) to be applied to room devices without affecting the broader network.',
    category: 'Networking',
    relatedTerms: ['qos', 'dscp', 'dhcp', 'switch-configuration'],
    relatedLessons: [
      { title: 'VLANs for AV', href: '/programs/mtr-systems-integration/tracks/network-infrastructure/modules/networking-fundamentals/lessons/vlans-for-av' },
    ],
  },
  't568b': {
    slug: 't568b',
    term: 'T568B',
    definition: 'The most common wiring standard for RJ-45 (Ethernet) patch cables and keystone jacks in North America. Defines the pin-to-pair assignment for terminating Cat5e/Cat6/Cat6A cables. In MTR AV installations, all data cable terminations should consistently follow T568B (or T568A, but never mixed within a run). Mixed wiring standards are a frequent cause of link failures during commissioning.',
    category: 'Cabling & Connectivity',
    relatedTerms: ['cat6a', 'rj45', 'cable-testing', 't568a'],
    relatedLessons: [
      { title: 'Termination Standards', href: '/programs/mtr-foundations/tracks/physical-installation/modules/cable-infrastructure/lessons/termination-standards' },
    ],
  },
}

export async function generateStaticParams() {
  return Object.keys(GLOSSARY).map((slug) => ({ term: slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { term: string }
}): Promise<Metadata> {
  const entry = GLOSSARY[params.term]
  if (!entry) return { title: 'Not Found' }
  return {
    title: `${entry.term} | MTR Glossary`,
    description: entry.definition.slice(0, 155) + '…',
  }
}

export default function GlossaryTermPage({
  params,
}: {
  params: { term: string }
}) {
  const entry = GLOSSARY[params.term]
  if (!entry) notFound()

  const relatedEntries = entry.relatedTerms
    ?.map((slug) => GLOSSARY[slug])
    .filter(Boolean) ?? []

  return (
    <div className="container-content py-8 max-w-3xl">
      <Link
        href="/glossary"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Glossary
      </Link>

      <div className="mb-2">
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
          {entry.category}
        </span>
      </div>
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
        {entry.term}
      </h1>

      <div className="prose prose-neutral dark:prose-invert max-w-none mb-8">
        <p className="text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
          {entry.definition}
        </p>
      </div>

      {entry.relatedLessons && entry.relatedLessons.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider mb-3">
            Learn more
          </h2>
          <div className="space-y-2">
            {entry.relatedLessons.map((lesson) => (
              <Link
                key={lesson.href}
                href={lesson.href}
                className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 group"
              >
                <BookOpen className="h-4 w-4 flex-shrink-0" />
                {lesson.title}
                <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {relatedEntries.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider mb-3">
            Related terms
          </h2>
          <div className="flex flex-wrap gap-2">
            {relatedEntries.map((related) => (
              <Link
                key={related.slug}
                href={`/glossary/${related.slug}`}
                className="text-sm px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-primary-300 hover:text-primary-600 dark:hover:border-primary-700 dark:hover:text-primary-400 transition-colors"
              >
                {related.term}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
