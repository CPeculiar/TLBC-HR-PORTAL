// src/pages/Events/handleAddToCalendar.js

export const handleAddToCalendar = (event) => {
  try {
    // Parse date and time
    const dateParts = event.date.replace(',', '').split(' ');
    const day = parseInt(dateParts[1].replace(/\D/g, ''));
    const month = getMonthNumber(dateParts[2].replace(',', ''));
    const year = parseInt(dateParts[3]);
    
    // Format time for calendar
    let timeString = event.time;
    let hours = parseInt(timeString.split(':')[0]);
    const minutes = parseInt(timeString.split(':')[1].split(' ')[0]);
    const isPM = timeString.toLowerCase().includes('pm');
    
    if (isPM && hours < 12) {
      hours += 12;
    } else if (!isPM && hours === 12) {
      hours = 0;
    }
    
    // Create date objects for start and end (assuming 1 hour duration)
    const startDate = new Date(year, month, day, hours, minutes);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);
    
    // Format dates for calendar URL
    const formatForCalendar = (date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const start = formatForCalendar(startDate);
    const end = formatForCalendar(endDate);
    
    // Create Google Calendar URL
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    
    // Open in new tab
    window.open(url, '_blank');
  } catch (error) {
    console.error("Error adding to calendar:", error);
    alert("Error adding to calendar. Please try again.");
  }
};

// Helper function to get month number from name
const getMonthNumber = (monthName) => {
  const months = {
    'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
    'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
  };
  return months[monthName];
};