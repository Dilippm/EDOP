// Illustrative UI fixtures only. These values are not connected to live systems.
export const repositories = [
  { name: 'rag-chatbot', description: 'Retrieval augmented generation service', branch: 'main', language: 'Python', status: 'Healthy' },
  { name: 'platform-api', description: 'Internal platform API', branch: 'main', language: 'JavaScript', status: 'Healthy' },
  { name: 'web-storefront', description: 'Customer facing storefront', branch: 'develop', language: 'TypeScript', status: 'Attention' },
];

export const pipelines = [
  { name: 'Build and test', repo: 'rag-chatbot', branch: 'main', commit: 'a81f42c', status: 'Succeeded', ago: '12 min ago', duration: '3m 42s' },
  { name: 'Build and test', repo: 'platform-api', branch: 'main', commit: 'c30b1de', status: 'Running', ago: '18 min ago', duration: 'Running' },
  { name: 'Build and test', repo: 'web-storefront', branch: 'develop', commit: 'e91a703', status: 'Failed', ago: '1 hr ago', duration: '2m 08s' },
  { name: 'Release image', repo: 'rag-chatbot', branch: 'main', commit: 'f28d116', status: 'Succeeded', ago: 'Yesterday', duration: '5m 16s' },
];

export const deployments = [
  { service: 'rag-chatbot', version: 'v0.8.2', environment: 'Development', status: 'Healthy', updated: 'Today, 10:42' },
  { service: 'platform-api', version: 'v0.4.0', environment: 'Development', status: 'Progressing', updated: 'Today, 10:35' },
  { service: 'web-storefront', version: 'v1.12.1', environment: 'Staging', status: 'Degraded', updated: 'Yesterday, 16:20' },
];

export const infrastructureJobs = [
  { environment: 'aws-test', operation: 'Plan', status: 'Awaiting review', requestedBy: 'Sample operator', updated: 'Today, 09:15' },
  { environment: 'local-dev', operation: 'Apply', status: 'Succeeded', requestedBy: 'Sample operator', updated: 'Yesterday, 14:08' },
];
