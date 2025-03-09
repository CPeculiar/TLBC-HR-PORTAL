// src/pages/Events/handleAddToCalendar.js

export const handleAddToCalendar = (event) => {
  try {
    // Check if required data exists
    if (!event.date || !event.time || !event.title) {
      throw new Error("Missing required event information");
    }

    // More robust date parsing
    let startDate, endDate;

    try {
      // First try to parse the date string directly
      const dateStr = event.date.trim();
      const timeStr = event.time.trim();
      
      // Extract date components with regex to handle various formats
      const dateMatch = dateStr.match(/([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/);
      
      if (!dateMatch) {
        throw new Error("Could not parse date format");
      }
      
      const monthName = dateMatch[1];
      const day = parseInt(dateMatch[2], 10);
      const year = parseInt(dateMatch[3], 10);
      const month = getMonthNumber(monthName);
      
      // Extract time components with regex
      const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(am|pm|AM|PM)?/);
      
      if (!timeMatch) {
        throw new Error("Could not parse time format");
      }
      
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3] ? timeMatch[3].toLowerCase() : null;
      
      // Convert to 24-hour format if needed
      if (ampm === "pm" && hours < 12) {
        hours += 12;
      } else if (ampm === "am" && hours === 12) {
        hours = 0;
      }
      
      // Create date objects
      startDate = new Date(year, month, day, hours, minutes);
      endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1); // Default 1 hour duration
      
    } catch (parseError) {
      console.error("Date parsing error:", parseError);
      // Fallback to current date and time as a last resort
      startDate = new Date();
      startDate.setMinutes(startDate.getMinutes() + 30); // Set to 30 minutes from now
      endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1);
    }
    
    // Format dates for calendar URL
    const formatForCalendar = (date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const start = formatForCalendar(startDate);
    const end = formatForCalendar(endDate);
    
    // Prepare details and handle missing fields
    const details = event.description || `Conductor: ${event.conductor || event.Conductor || 'N/A'}`;
    const location = event.location || 'TBD';
    
    // Create calendar URL - compatible with both Google Calendar and Apple Calendar
    const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
    
    // For mobile devices, try to detect iOS for better calendar integration
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      // iOS devices - try to use webcal protocol which works better with iOS Calendar
      const iosUrl = `webcal://calendar.google.com/calendar/ical/${start}/${end}/${encodeURIComponent(event.title)}.ics`;
      window.location.href = iosUrl;
    } else {
      // Other devices - use standard Google Calendar link
      window.open(googleUrl, '_blank');
    }
    
  } catch (error) {
    console.error("Error adding to calendar:", error);
    alert("Could not add to calendar. Please try again or add manually.");
  }
};

// Improved helper function to get month number from name (more flexible)
const getMonthNumber = (monthName) => {
  const months = {
    'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
    'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11,
    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'jun': 5, 'jul': 6, 'aug': 7, 'sep': 8, 
    'sept': 8, 'oct': 9, 'nov': 10, 'dec': 11
  };
  
  // Normalize the month name (lowercase and trim)
  const normalizedMonth = monthName.toLowerCase().trim();
  
  // Return the month number or default to current month if not found
  return months[normalizedMonth] !== undefined ? 
    months[normalizedMonth] : 
    new Date().getMonth();
};