import { redirect } from 'next/navigation'

export default function SettingsHome() {
    redirect('/settings/account');
    return <></>;
};