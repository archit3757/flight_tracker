// This script helps us switch between light and dark modes

// 1. Find the toggle button on the page
const themeButton = document.getElementById('theme-toggle');

// 2. Add an "event listener" that waits for a click
themeButton.addEventListener('click', function() {
  
  // 3. Toggle the "dark-mode" class on the body tag
  // "Toggle" means: if it's there, remove it. If it's not there, add it.
  document.body.classList.toggle('dark-mode');
  
  // 4. Update the icon inside the button
  updateIcon();
});


// This helper function changes the icon based on the current theme
function updateIcon() {
  const isDark = document.body.classList.contains('dark-mode');
  
  if (isDark) {
    // Show a sun icon when in dark mode
    themeButton.innerHTML = '<i data-lucide="sun"></i>';
  } else {
    // Show a moon icon when in light mode
    themeButton.innerHTML = '<i data-lucide="moon"></i>';
  }
  
  // Refresh the Lucide icons to draw the new one
  if (window.lucide) {
    lucide.createIcons();
  }
}

// Set the initial icon when the page loads
document.addEventListener('DOMContentLoaded', updateIcon);
