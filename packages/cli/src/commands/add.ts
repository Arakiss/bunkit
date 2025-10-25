import * as p from '@clack/prompts';

export async function addCommand(feature: string, options: { provider?: string }) {
  const s = p.spinner();
  s.start(`Adding ${feature}...`);

  // Simulate feature addition
  await new Promise((resolve) => setTimeout(resolve, 1500));

  s.stop(`${feature} added!`);

  p.log.success(`Successfully added ${feature} to your project`);
}
