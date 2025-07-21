import type { Meta, StoryObj } from '@storybook/react';
import { SocialMediaTest } from './SocialMediaTest';

const meta: Meta<typeof SocialMediaTest> = {
  title: '🧪 Tests/Social Media Service',
  component: SocialMediaTest,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SocialMediaTest>;

export const Default: Story = {
  name: '🔍 Teste do Serviço Social Media',
  args: {},
};