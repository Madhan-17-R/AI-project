import SettingsClient from './SettingsClient';

export const metadata = {
  title: 'Settings — Marudam',
};

export default function SettingsPage() {
  const hasAi = !!process.env.OPENAI_API_KEY;
  return <SettingsClient hasAi={hasAi} />;
}
