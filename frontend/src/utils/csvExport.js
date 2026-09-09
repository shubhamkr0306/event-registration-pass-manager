/**
 * Client-side CSV export utility for attendee and pass rosters
 */

export const exportAttendeesToCSV = (attendees, filenamePrefix = 'attendees_roster') => {
  if (!attendees || attendees.length === 0) {
    alert('No attendee data available to export.');
    return;
  }

  const headers = [
    'Pass Code',
    'Attendee Name',
    'Attendee Email',
    'Event Title',
    'Category',
    'Event Date',
    'Venue / Location',
    'Ticket Price',
    'Pass Status',
    'Registration Date',
    'Gate Check-in Time'
  ];

  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '""';
    const stringValue = String(value).replace(/"/g, '""');
    return `"${stringValue}"`;
  };

  const rows = attendees.map((att) => {
    const formattedEventDate = att.event_date
      ? new Date(att.event_date).toLocaleString()
      : 'N/A';
    const formattedRegDate = att.registered_at
      ? new Date(att.registered_at).toLocaleString()
      : 'N/A';
    const formattedCheckIn = att.status === 'USED' && att.check_in_time
      ? new Date(att.check_in_time).toLocaleString()
      : att.status === 'USED'
      ? 'Checked In (Gate Admitted)'
      : 'Pending Entry';

    return [
      escapeCSV(att.pass_code),
      escapeCSV(att.attendee_name),
      escapeCSV(att.attendee_email),
      escapeCSV(att.event_title),
      escapeCSV(att.category || 'Technology'),
      escapeCSV(formattedEventDate),
      escapeCSV(att.venue ? `${att.venue}, ${att.location || ''}` : att.location || 'N/A'),
      escapeCSV(att.ticket_price > 0 ? `₹${att.ticket_price}` : 'Free Access'),
      escapeCSV(att.status),
      escapeCSV(formattedRegDate),
      escapeCSV(formattedCheckIn)
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `${filenamePrefix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
