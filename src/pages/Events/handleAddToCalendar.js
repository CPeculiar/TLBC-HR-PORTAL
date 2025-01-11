export const handleAddToCalendar = (event) => {
  // Format the event details for calendar
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  // Parse the date string (assuming format like "Friday, 3rd January, 2025")
  const dateStr = event.date.split(',')[1].trim() + ',' + event.date.split(',')[2].trim();
  const startDate = new Date(dateStr);
  
  // Set the time if provided
  if (event.time) {
    const timeStr = event.time.replace('Arrival', '').trim();
    const [hours, minutes] = timeStr.match(/\d+/g) || [0, 0];
    const isPM = timeStr.toLowerCase().includes('pm');
    startDate.setHours(
      isPM ? parseInt(hours) + 12 : parseInt(hours),
      parseInt(minutes) || 0
    );
  }

  // Set end date to 2 hours after start
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  // Create the ICS file content
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
BEGIN:VALARM
TRIGGER:-PT24H
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;

  // Create and trigger download
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${event.title}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};