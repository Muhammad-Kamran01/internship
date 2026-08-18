export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatFileSize(bytes: number | undefined): string {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function getDaysRemaining(deadlineStr: string): { days: number; isOverdue: boolean } {
  try {
    const deadline = new Date(deadlineStr).getTime();
    const now = new Date().getTime();
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      days: Math.abs(diffDays),
      isOverdue: diffDays < 0,
    };
  } catch {
    return { days: 0, isOverdue: false };
  }
}
