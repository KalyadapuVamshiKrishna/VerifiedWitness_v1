/** Investigation IDs match the existing UI convention seen in the prototype mocks (e.g. "VW-2023-9901"). */
export function generateInvestigationId(): string {
  const year = new Date().getFullYear()
  const suffix = Math.floor(1000 + Math.random() * 9000)
  return `VW-${year}-${suffix}`
}
