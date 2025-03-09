document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Add click event listeners to each navigation link
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the page to display from data-page attribute
            const pageToShow = this.getAttribute('data-page');
            
            // Handle logout separately if needed
            if (pageToShow === 'logout') {
                // Send a request to the backend for logout
                fetch('/api/logout/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCSRFToken() // Function to get Django CSRF token
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = '/login/'; // Redirect to login page
                    }
                });
                return;
            }
            
            // Remove active class from all links and add to the clicked one
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
            
            // Hide all content pages
            const contentPages = document.querySelectorAll('.content-page');
            contentPages.forEach(page => page.classList.remove('active'));
            
            // Show the selected page
            const selectedPage = document.getElementById(pageToShow + '-page');
            if (selectedPage) {
                selectedPage.classList.add('active');
            } else {
                // If page doesn't exist yet, load it from the server
                loadPageContent(pageToShow);
            }
        });
    });
    
    // Function to get CSRF token from cookies (for Django)
    function getCSRFToken() {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
        return cookieValue || '';
    }
    
    // Function to load page content from the server
    function loadPageContent(pageName) {
        // Show loading indicator
        const contentContainer = document.getElementById('content-container');
        contentContainer.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        
        // Fetch page content from the server
        fetch(`/api/get-page/${pageName}/`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.html) {
                // Create a new page div
                const newPage = document.createElement('div');
                newPage.id = pageName + '-page';
                newPage.className = 'content-page active';
                newPage.innerHTML = data.html;
                
                // Replace loading indicator with new page
                contentContainer.innerHTML = '';
                contentContainer.appendChild(newPage);
                
                // Initialize any page-specific JavaScript
                if (data.js_init && typeof window[data.js_init] === 'function') {
                    window[data.js_init]();
                }
            } else {
                contentContainer.innerHTML = '<div class="alert alert-danger">Error loading content</div>';
            }
        })
        .catch(error => {
            console.error('Error loading page:', error);
            contentContainer.innerHTML = '<div class="alert alert-danger">Error loading content</div>';
        });
    }
    
    // User profile dropdown
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        userProfile.addEventListener('click', function() {
            // Toggle a dropdown menu
            const dropdown = document.querySelector('.user-dropdown');
            if (dropdown) {
                dropdown.classList.toggle('show');
            } else {
                // Create dropdown if it doesn't exist
                const newDropdown = document.createElement('div');
                newDropdown.className = 'user-dropdown';
                newDropdown.innerHTML = `
                    <div class="dropdown-menu show">
                        <a class="dropdown-item" href="#" data-page="profile">Profile</a>
                        <a class="dropdown-item" href="#" data-page="settings">Settings</a>
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item" href="#" data-page="logout">Logout</a>
                    </div>
                `;
                userProfile.appendChild(newDropdown);
                
                // Add event listeners to the new dropdown items
                const dropdownItems = newDropdown.querySelectorAll('.dropdown-item');
                dropdownItems.forEach(item => {
                    item.addEventListener('click', function(e) {
                        e.preventDefault();
                        
                        const pageToShow = this.getAttribute('data-page');
                        
                        // Simulate click on the main navigation link
                        const mainNavLink = document.querySelector(`.nav-link[data-page="${pageToShow}"]`);
                        if (mainNavLink) {
                            mainNavLink.click();
                        }
                        
                        // Hide dropdown
                        newDropdown.remove();
                    });
                });
                
                // Close dropdown when clicking outside
                document.addEventListener('click', function closeDropdown(e) {
                    if (!userProfile.contains(e.target)) {
                        newDropdown.remove();
                        document.removeEventListener('click', closeDropdown);
                    }
                });
            }
        });
    }
    
    // Initialize any page-specific functionality
    initHomePage();
});

// Home page initialization
function initHomePage() {
    console.log('Home page initialized');
    // Add specific functionality for the home page
}

// Dashboard page initialization (will be called when loaded)
function initDashboardPage() {
    console.log('Dashboard page initialized');
    // Add specific functionality for the dashboard page
}

// Game initialization - for pong game
function initGamePage() {
    console.log('Game page initialized');
    // Add game-specific code here
}