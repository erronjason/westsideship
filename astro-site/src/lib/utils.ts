export const WEEKDAY_KEYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

export const WEEKDAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
};

function toMinutes(time: string | null | undefined) {
  if (!time) return null;
  const [hours, minutes] = time.split(':').map((part) => Number.parseInt(part, 10));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

function formatHour(minutes: number) {
  const hrs24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hrs24 >= 12 ? 'PM' : 'AM';
  const hrs12 = ((hrs24 + 11) % 12) + 1;
  const paddedMins = mins.toString().padStart(2, '0');
  return `${hrs12}:${paddedMins} ${period}`;
}

export function formatTimeLabel(time: string | null | undefined) {
  const minutes = toMinutes(time ?? undefined);
  return minutes === null ? null : formatHour(minutes);
}

export type DayHours = {
  key: string;
  label: string;
  closed: boolean;
  open?: string | null;
  close?: string | null;
};

export function parseHours(hours: Record<string, any> | null | undefined): DayHours[] {
  const data = hours ?? {};
  return WEEKDAY_KEYS.map((key) => {
    const entry = data?.[key] ?? {};
    const closed = Boolean(entry?.closed) || !entry?.open || !entry?.close;
    return {
      key,
      label: WEEKDAY_LABELS[key] ?? key,
      closed,
      open: entry?.open ?? null,
      close: entry?.close ?? null
    };
  });
}

function getTodayKey(date = new Date()) {
  const dayIndex = date.getDay();
  // getDay: 0 Sunday ... 6 Saturday
  const map = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return map[dayIndex];
}

export function getOpenStatus(hours: Record<string, any> | null | undefined, now = new Date()) {
  const todayKey = getTodayKey(now);
  const hoursList = parseHours(hours);
  const today = hoursList.find((item) => item.key === todayKey) ?? {
    key: todayKey,
    label: WEEKDAY_LABELS[todayKey] ?? todayKey,
    closed: true
  };

  const openMinutes = toMinutes(today.open ?? undefined);
  const closeMinutes = toMinutes(today.close ?? undefined);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isOpen = !today.closed && openMinutes !== null && closeMinutes !== null && currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  let nextOpen: { dayKey: string; label: string; open: string | null } | null = null;
  if (!isOpen) {
    const startIndex = WEEKDAY_KEYS.indexOf(todayKey === 'sunday' ? 'monday' : todayKey);
    const ordered = [...WEEKDAY_KEYS.slice(startIndex >= 0 ? startIndex : 0), ...WEEKDAY_KEYS.slice(0, startIndex >= 0 ? startIndex : 0)];
    const searchKeys = todayKey === 'sunday' ? ['sunday', ...ordered] : [todayKey, ...ordered];
    for (const key of searchKeys) {
      const item = hoursList.find((entry) => entry.key === key);
      if (item && !item.closed && item.open) {
        const openLabel = formatTimeLabel(item.open);
        nextOpen = {
          dayKey: item.key,
          label: item.label,
          open: openLabel
        };
        if (key === todayKey && openMinutes !== null && currentMinutes < openMinutes) {
          break;
        }
        if (key !== todayKey) {
          break;
        }
      }
    }
  }

  const display = today.closed || openMinutes === null || closeMinutes === null
    ? 'Closed today'
    : `${formatTimeLabel(today.open)} – ${formatTimeLabel(today.close)}`;

  return {
    isOpen,
    todayKey,
    today,
    hoursList,
    display,
    nextOpen
  };
}

export function sanitizePhoneNumber(phone: string | null | undefined) {
  if (!phone) return '';
  const cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  return cleaned.startsWith('1') && cleaned.length === 11 ? `+${cleaned}` : cleaned;
}

export function telHref(phone: string | null | undefined) {
  const value = sanitizePhoneNumber(phone);
  return value ? `tel:${value}` : undefined;
}

export function mailtoHref(email: string | null | undefined) {
  if (!email) return undefined;
  return `mailto:${email}`;
}

export function ensureArray<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
}

export function absoluteUrl(requestUrl: string | null | undefined, path: string) {
  try {
    if (!requestUrl) return path;
    const url = new URL(requestUrl);
    return new URL(path, `${url.protocol}//${url.host}`).toString();
  } catch (error) {
    return path;
  }
}
