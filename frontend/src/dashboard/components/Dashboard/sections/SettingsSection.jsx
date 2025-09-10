import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, 
  Stack, 
  Text, 
  Paper, 
  Group, 
  Card, 
  Button,
  Grid,
  TextInput,
  Select,
  Switch,
  Divider,
  ActionIcon,
  FileInput,
  NumberInput,
  Textarea,
  PasswordInput,
  Alert
} from '@mantine/core';
import { 
  IconUser, 
  IconMail, 
  IconPhone, 
  IconCalendar,
  IconMapPin,
  IconLanguage,
  IconBell,
  IconCamera,
  IconDeviceFloppy,
  IconEdit,
  IconX,
  IconShieldLock,
  IconMoonStars,
  IconSun,
  IconCheck,
  IconInfoCircle
} from '@tabler/icons-react';
import { updateProfileComplete, fetchProfile, requestEmailVerification, changePassword, updateProfile, fetchDevices, revokeDevice, revokeAllDevices, twofaSetup, twofaEnable, twofaDisable } from '../../../../store/authSlice';
import { useTheme } from '../../../../shared/components/Theme/ThemeProvider.jsx';
import { API_BASE_URL } from '../../../../shared/services/api.js';
import QRCode from 'qrcode';

const SettingsSection = () => {
  const dispatch = useDispatch();
  const themeCtx = useTheme();
  const { user, profileUpdating, devices, devicesLoading, twofa } = useSelector((state) => state.auth);
  const [twofaCode, setTwofaCode] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    city: '',
    country: '',
    language: localStorage.getItem('app_language') || 'ru',
    theme: localStorage.getItem('colorScheme') || 'light',
    notifications: {
      email: true,
      push: true,
      sms: false,
      deadlines: true,
      progress: true,
      ai: true
    }
  });

  const [ieltsGoals, setIeltsGoals] = useState({ current: 0, target: 0, testDate: '' });
  const [tolcGoals, setTolcGoals] = useState({ current: 0, target: 0, testDate: '' });

  // Security form
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [pwdMsg, setPwdMsg] = useState(null);

  useEffect(() => {
    if (user) {
      setUserData(prev => ({
        ...prev,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        birthDate: user.date_of_birth || '',
        city: user.city || '',
        country: user.country || '',
      }));
      const raw = user?.avatar || '';
      const abs = raw && (raw.startsWith('http://') || raw.startsWith('https://')) ? raw : (raw ? `${API_BASE_URL}${raw.startsWith('/') ? '' : '/'}${raw}` : '');
      setAvatarPreview(abs);
      setIeltsGoals({
        current: user?.profile?.ielts_current_score || 0,
        target: user?.profile?.ielts_target_score || 0,
        testDate: user?.profile?.ielts_exam_date || ''
      });
      setTolcGoals({
        current: user?.profile?.tolc_current_score || 0,
        target: user?.profile?.tolc_target_score || 0,
        testDate: user?.profile?.tolc_exam_date || ''
      });
    }
  }, [user]);

  // Load devices list once
  useEffect(() => {
    dispatch(fetchDevices());
  }, [dispatch]);

  const autoSaveField = async (patch) => {
    try {
      // sanitize date field if present
      if (Object.prototype.hasOwnProperty.call(patch, 'date_of_birth')) {
        patch.date_of_birth = patch.date_of_birth ? patch.date_of_birth : null;
      }
      await dispatch(updateProfile(patch)).unwrap();
      await dispatch(fetchProfile());
    } catch (e) {
      // fail silently to not break UX
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        avatar: avatarFile instanceof File ? avatarFile : undefined,
        ielts_current_score: ieltsGoals.current,
        ielts_target_score: ieltsGoals.target,
        ielts_exam_date: ieltsGoals.testDate || null,
        tolc_current_score: tolcGoals.current,
        tolc_target_score: tolcGoals.target,
        tolc_exam_date: tolcGoals.testDate || null,
      };
      const res = await dispatch(updateProfileComplete(payload)).unwrap();
      const updated = res?.user;
      if (updated?.avatar) {
        const raw = updated.avatar;
        const abs = raw && (raw.startsWith('http://') || raw.startsWith('https://')) ? raw : `${API_BASE_URL}${raw.startsWith('/') ? '' : '/'}${raw}`;
        setAvatarPreview(abs);
      }
      await dispatch(fetchProfile());
    } finally {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(user?.avatar || '');
  };

  const submitPasswordChange = async () => {
    setPwdMsg(null);
    if (!pwdForm.current || !pwdForm.next || pwdForm.next !== pwdForm.confirm) {
      setPwdMsg({ type: 'error', text: 'Проверьте поля пароля' });
      return;
    }
    try {
      const res = await dispatch(changePassword({ old_password: pwdForm.current, new_password: pwdForm.next, new_password_confirm: pwdForm.confirm })).unwrap();
      setPwdMsg({ type: 'success', text: res?.message || 'Пароль изменен' });
      setPwdForm({ current: '', next: '', confirm: '' });
    } catch (e) {
      setPwdMsg({ type: 'error', text: 'Ошибка изменения пароля' });
    }
  };

  return (
    <Box style={{ padding: 'var(--app-spacing-md)' }}>
      <Stack gap="xl">
        {/* Header */}
        <Paper className="p-6" shadow="sm" style={{ padding: 'var(--app-spacing-md)' }}>
          <Group position="apart" align="center">
            <Box>
              <Text size="xl" fw={700} c="dark">
                Настройки профиля
              </Text>
              <Text size="sm" c="dimmed" mt={4}>
                Управление личными данными и настройками
              </Text>
            </Box>
            <Button
              leftSection={<IconEdit size={16} />}
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "filled"}
            >
              {isEditing ? 'Отменить' : 'Редактировать'}
            </Button>
          </Group>
        </Paper>

        {/* Personal Information */}
        <Paper className="p-6" shadow="sm" style={{ padding: 'var(--app-spacing-md)' }}>
          <Text size="lg" fw={600} className="mb-4">
            Личная информация
          </Text>
          
          <Group position="apart" align="flex-start">
            <Stack gap="xs" align="center">
              <Box
                style={{
                  width: 180,
                  height: 240,
                  border: '1px solid var(--mantine-color-gray-4)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: 'var(--mantine-color-gray-1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Фото профиля"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Text c="dimmed">Нет фото</Text>
                )}
              </Box>
              {isEditing && (
                <FileInput
                  placeholder="Загрузить фото"
                  leftSection={<IconCamera size={16} />}
                  onChange={(file) => {
                    setAvatarFile(file);
                    if (file instanceof File) {
                      const url = URL.createObjectURL(file);
                      setAvatarPreview(url);
                    } else {
                      setAvatarPreview(user?.avatar || '');
                    }
                  }}
                  accept="image/*"
                  size="sm"
                />
              )}
            </Stack>
            
            <Box style={{ flex: 1 }}>
              <Text size="lg" fw={600} mb="md">
                {userData.firstName} {userData.lastName}
              </Text>
              
              <Grid>
                <Grid.Col span={6}>
                  <TextInput
                    label="Имя"
                    value={userData.firstName}
                    onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                    onBlur={() => autoSaveField({ first_name: userData.firstName })}
                    disabled={!isEditing}
                    leftSection={<IconUser size={16} />}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Фамилия"
                    value={userData.lastName}
                    onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                    onBlur={() => autoSaveField({ last_name: userData.lastName })}
                    disabled={!isEditing}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Email"
                    value={userData.email}
                    disabled
                    leftSection={<IconMail size={16} />}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Телефон"
                    value={userData.phone}
                    onChange={(e) => setUserData({...userData, phone: e.target.value})}
                    onBlur={() => autoSaveField({ phone: userData.phone })}
                    disabled={!isEditing}
                    leftSection={<IconPhone size={16} />}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Дата рождения"
                    type="date"
                    value={userData.birthDate}
                    onChange={(e) => setUserData({...userData, birthDate: e.target.value})}
                    onBlur={() => autoSaveField({ date_of_birth: userData.birthDate })}
                    disabled={!isEditing}
                    leftSection={<IconCalendar size={16} />}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Город"
                    value={userData.city}
                    onChange={(e) => setUserData({...userData, city: e.target.value})}
                    onBlur={() => autoSaveField({ city: userData.city })}
                    disabled={!isEditing}
                    leftSection={<IconMapPin size={16} />}
                  />
                </Grid.Col>
              </Grid>
            </Box>
          </Group>
        </Paper>

        {/* Preferences */}
        <Paper className="p-6" shadow="sm" style={{ padding: 'var(--app-spacing-md)' }}>
          <Text size="lg" fw={600} className="mb-4">
            Предпочтения
          </Text>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Язык интерфейса"
                data={[{ value: 'ru', label: 'Русский' }, { value: 'en', label: 'English' }]}
                value={userData.language}
                onChange={(v) => {
                  setUserData({ ...userData, language: v });
                  localStorage.setItem('app_language', v || 'ru');
                }}
                leftSection={<IconLanguage size={16} />}
                disabled={!isEditing}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Тема"
                data={[{ value: 'light', label: 'Светлая' }, { value: 'dark', label: 'Тёмная' }]}
                value={userData.theme}
                onChange={(v) => {
                  setUserData({ ...userData, theme: v });
                  themeCtx.updateColorScheme(v || 'light');
                }}
                leftSection={userData.theme === 'dark' ? <IconMoonStars size={16} /> : <IconSun size={16} />}
                disabled={!isEditing}
              />
            </Grid.Col>
          </Grid>
          <Alert icon={<IconInfoCircle size={16} />} mt="sm" variant="light">
            Язык влияет на интерфейс в будущей версии. Тема применяется сразу и сохраняется локально.
          </Alert>
        </Paper>

        {/* Security */}
        <Paper className="p-6" shadow="sm" style={{ padding: 'var(--app-spacing-md)' }}>
          <Group align="center" gap="sm" mb="sm">
            <IconShieldLock size={18} />
            <Text size="lg" fw={600}>Безопасность</Text>
          </Group>
          {pwdMsg && (
            <Alert color={pwdMsg.type === 'success' ? 'green' : 'red'} mb="sm" icon={<IconInfoCircle size={16} />}>{pwdMsg.text}</Alert>
          )}
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <PasswordInput label="Текущий пароль" value={pwdForm.current} onChange={(e)=>setPwdForm({...pwdForm, current:e.target.value})} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <PasswordInput label="Новый пароль" value={pwdForm.next} onChange={(e)=>setPwdForm({...pwdForm, next:e.target.value})} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <PasswordInput label="Повторите новый пароль" value={pwdForm.confirm} onChange={(e)=>setPwdForm({...pwdForm, confirm:e.target.value})} />
            </Grid.Col>
          </Grid>
          <Group justify="flex-end" mt="sm">
            <Button onClick={submitPasswordChange} loading={profileUpdating}>Сменить пароль</Button>
          </Group>
        </Paper>

        {/* Sessions & Devices */}
        <Paper className="p-6" shadow="sm" style={{ padding: 'var(--app-spacing-md)' }}>
          <Group align="center" gap="sm" mb="sm">
            <IconShieldLock size={18} />
            <Text size="lg" fw={600}>Сессии и устройства</Text>
          </Group>
          <Text size="sm" c="dimmed" mb="sm">Список активных устройств, с которых выполнен вход.</Text>
          <Stack gap="sm">
            {devicesLoading && <Text size="sm" c="dimmed">Загрузка устройств…</Text>}
            {!devicesLoading && devices.length === 0 && (
              <Text size="sm" c="dimmed">Активных устройств не найдено.</Text>
            )}
            {devices.map((d) => (
              <Card key={d.id} withBorder radius="md" shadow="sm" style={{ background: 'var(--app-color-surface)' }}>
                <Group justify="space-between" align="flex-start">
                  <Box style={{ maxWidth: '70%' }}>
                    <Text fw={600} size="sm" style={{ wordBreak: 'break-word' }}>{d.user_agent || 'Неизвестное устройство'}</Text>
                    <Text size="xs" c="dimmed">IP: {d.ip_address || '—'}</Text>
                    <Text size="xs" c="dimmed">Последняя активность: {new Date(d.last_seen).toLocaleString('ru-RU')}</Text>
                  </Box>
                  <Group gap="xs">
                    <Button size="xs" variant="outline" color="red" onClick={() => dispatch(revokeDevice(d.id)).then(()=>dispatch(fetchDevices()))}>Завершить</Button>
                  </Group>
                </Group>
              </Card>
            ))}
          </Stack>
          <Group justify="flex-end" mt="md">
            <Button variant="light" color="red" onClick={() => dispatch(revokeAllDevices()).then(()=>dispatch(fetchDevices()))}>Завершить все сессии</Button>
          </Group>
        </Paper>

        {/* Two-Factor Authentication */}
        <Paper className="p-6" shadow="sm" style={{ padding: 'var(--app-spacing-md)' }}>
          <Group align="center" gap="sm" mb="sm">
            <IconShieldLock size={18} />
            <Text size="lg" fw={600}>Двухфакторная аутентификация (2FA)</Text>
          </Group>
          {!user?.two_factor_enabled ? (
            <Stack gap="sm">
              <Text size="sm" c="dimmed">Для повышения безопасности включите 2FA через приложение Google Authenticator / Authy.</Text>
              <Group>
                <Button onClick={async () => {
                  const res = await dispatch(twofaSetup(false));
                  const url = res?.payload?.otpauth_url;
                  if (url) {
                    try {
                      const dataUrl = await QRCode.toDataURL(url);
                      setQrDataUrl(dataUrl);
                    } catch (e) {
                      setQrDataUrl('');
                    }
                  }
                }} loading={twofa.loading}>Сгенерировать секрет</Button>
                {twofa.otpauth_url && (
                  <Button variant="light" onClick={() => window.open(twofa.otpauth_url, '_blank')}>Открыть otpauth URL</Button>
                )}
              </Group>
              {twofa.secret && (
                <Alert variant="light">Секрет: {twofa.secret}</Alert>
              )}
              {qrDataUrl && (
                <Group>
                  <img src={qrDataUrl} alt="2FA QR" style={{ width: 140, height: 140 }} />
                  <Box>
                    <Text size="sm" c="dimmed">Сканируйте QR в приложении-автентификаторе</Text>
                  </Box>
                </Group>
              )}
              <Group>
                <TextInput label="Код из приложения" value={twofaCode} onChange={(e)=>setTwofaCode(e.target.value)} style={{ maxWidth: 220 }} />
                <Button onClick={() => dispatch(twofaEnable(twofaCode)).then(()=>{dispatch(fetchProfile()); setQrDataUrl('');})} disabled={!twofaCode}>Включить 2FA</Button>
              </Group>
            </Stack>
          ) : (
            <Group justify="space-between">
              <Text>2FA включена</Text>
              <Button variant="outline" color="red" onClick={() => dispatch(twofaDisable()).then(()=>dispatch(fetchProfile()))}>Отключить 2FA</Button>
            </Group>
          )}
        </Paper>

        {/* Email verification */}
        {!user?.is_verified && (
          <Paper className="p-6" shadow="sm" style={{ padding: 'var(--app-spacing-md)' }}>
            <Group position="apart">
              <Text>Ваш email не подтверждён.</Text>
              <Button variant="light" onClick={() => dispatch(requestEmailVerification())}>Отправить письмо подтверждения</Button>
            </Group>
          </Paper>
        )}

        {/* Notifications */}
        <Paper className="p-6" shadow="sm" style={{ padding: 'var(--app-spacing-md)' }}>
          <Text size="lg" fw={600} className="mb-4">
            Уведомления
          </Text>
          
          <Stack gap="md">
            <Group position="apart">
              <Box>
                <Text fw={500}>Email уведомления</Text>
                <Text size="sm" c="dimmed">Получать уведомления на email</Text>
              </Box>
              <Switch
                checked={userData.notifications.email}
                onChange={(e) => setUserData({
                  ...userData,
                  notifications: {...userData.notifications, email: e.currentTarget.checked}
                })}
                disabled={!isEditing}
              />
            </Group>
            
            <Group position="apart">
              <Box>
                <Text fw={500}>Push уведомления</Text>
                <Text size="sm" c="dimmed">Получать push уведомления</Text>
              </Box>
              <Switch
                checked={userData.notifications.push}
                onChange={(e) => setUserData({
                  ...userData,
                  notifications: {...userData.notifications, push: e.currentTarget.checked}
                })}
                disabled={!isEditing}
              />
            </Group>
            
            <Group position="apart">
              <Box>
                <Text fw={500}>SMS уведомления</Text>
                <Text size="sm" c="dimmed">Получать SMS уведомления</Text>
              </Box>
              <Switch
                checked={userData.notifications.sms}
                onChange={(e) => setUserData({
                  ...userData,
                  notifications: {...userData.notifications, sms: e.currentTarget.checked}
                })}
                disabled={!isEditing}
              />
            </Group>
          </Stack>
        </Paper>

        {/* Save/Cancel Buttons */}
        {isEditing && (
          <Group position="right">
            <Button
              variant="outline"
              leftSection={<IconX size={16} />}
              onClick={handleCancel}
            >
              Отменить
            </Button>
            <Button
              leftSection={<IconDeviceFloppy size={16} />}
              onClick={handleSave}
              loading={profileUpdating}
            >
              Сохранить
            </Button>
          </Group>
        )}
      </Stack>
    </Box>
  );
};

export default SettingsSection;
