// Main Application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
});

function initApp() {
    // Set up section navigation
    setupNavigation();
    
    // Initialize all sections
    initDashboard();
    initSiteManagement();
    initShiftAllocation();
    initAnalytics();
    
    // Set dashboard as active by default
    document.querySelector('#dashboard').classList.add('active-section');
}

// Navigation Setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all sections
            document.querySelectorAll('section').forEach(section => {
                section.classList.remove('active-section');
            });
            
            // Add active class to target section
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).classList.add('active-section');
            
            // Update UI based on active section
            updateActiveSection(targetId);
        });
    });
}

function updateActiveSection(sectionId) {
    // You can add section-specific initialization here if needed
    switch(sectionId) {
        case '#dashboard':
            refreshDashboard();
            break;
        case '#sites':
            loadSiteMap();
            loadSitesList();
            break;
        case '#shifts':
            loadShiftCalendar();
            break;
        case '#analytics':
            loadAnalyticsCharts();
            break;
    }
}

// Dashboard Functions
function initDashboard() {
    // Initialize dashboard map
    const dashboardMap = L.map('dashboard-map').setView([52.9225, -1.4746], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(dashboardMap);
    
    // Add cleaner's location marker
    const cleanerLocation = L.marker([52.9225, -1.4746]).addTo(dashboardMap)
        .bindPopup('Your Current Location')
        .openPopup();
    
    // Add some nearby sites (in a real app, these would come from an API)
    const nearbySites = [
        { lat: 52.925, lng: -1.477, id: 'SC-001', priority: 'high' },
        { lat: 52.92, lng: -1.47, id: 'SC-002', priority: 'medium' },
        { lat: 52.918, lng: -1.48, id: 'SC-003', priority: 'low' },
        { lat: 52.927, lng: -1.472, id: 'SC-004', priority: 'medium' },
        { lat: 52.915, lng: -1.465, id: 'SC-005', priority: 'high' },
    ];
    
    nearbySites.forEach(site => {
        let iconColor;
        switch(site.priority) {
            case 'high': iconColor = 'red'; break;
            case 'medium': iconColor = 'orange'; break;
            case 'low': iconColor = 'green'; break;
        }
        
        const siteIcon = L.divIcon({
            className: 'custom-icon',
            html: `<div style="background-color: ${iconColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });
        
        L.marker([site.lat, site.lng], { icon: siteIcon })
            .addTo(dashboardMap)
            .bindPopup(`Site ID: ${site.id}<br>Priority: ${site.priority}`);
    });
    
    // Load upcoming shifts
    loadUpcomingShifts();
}

function refreshDashboard() {
    // In a real app, this would fetch fresh data from the server
    console.log('Refreshing dashboard data...');
}

function loadUpcomingShifts() {
    const upcomingShifts = [
        { date: '2023-06-05', time: '09:00 - 13:00', site: 'SC-001 - 123 Clean St, Derby', distance: '1.2 miles' },
        { date: '2023-06-07', time: '14:00 - 18:00', site: 'SC-004 - 456 Fresh Ave, Derby', distance: '2.5 miles' },
        { date: '2023-06-09', time: '08:00 - 12:00', site: 'SC-002 - 789 Tidy Rd, Derby', distance: '0.8 miles' },
    ];
    
    const shiftsList = document.getElementById('upcoming-shifts-list');
    shiftsList.innerHTML = '';
    
    upcomingShifts.forEach(shift => {
        const shiftElement = document.createElement('div');
        shiftElement.className = 'shift-item';
        shiftElement.innerHTML = `
            <div class="shift-date">${new Date(shift.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}</div>
            <div class="shift-time">${shift.time}</div>
            <div class="shift-site">${shift.site}</div>
            <div class="shift-distance">${shift.distance}</div>
        `;
        shiftsList.appendChild(shiftElement);
    });
}

// Site Management Functions
function initSiteManagement() {
    // Set up event listeners
    document.getElementById('refresh-sites').addEventListener('click', loadSitesList);
    document.getElementById('city-filter').addEventListener('change', loadSitesList);
    document.getElementById('site-search').addEventListener('input', debounce(loadSitesList, 300));
    document.getElementById('prev-page').addEventListener('click', () => changePage(-1));
    document.getElementById('next-page').addEventListener('click', () => changePage(1));
    
    // Initialize map
    loadSiteMap();
    
    // Load initial site list
    loadSitesList();
}

let currentPage = 1;
const sitesPerPage = 20;
let totalSites = 950;

function loadSiteMap() {
    const sitesMap = L.map('sites-map').setView([52.9225, -1.4746], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(sitesMap);
    
    // In a real app, these would come from an API
    const allSites = generateSampleSites(950);
    
    allSites.forEach(site => {
        let iconColor;
        switch(site.priority) {
            case 'high': iconColor = 'red'; break;
            case 'medium': iconColor = 'orange'; break;
            case 'low': iconColor = 'green'; break;
        }
        
        const siteIcon = L.divIcon({
            className: 'custom-icon',
            html: `<div style="background-color: ${iconColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });
        
        L.marker([site.lat, site.lng], { icon: siteIcon })
            .addTo(sitesMap)
            .bindPopup(`Site ID: ${site.id}<br>Address: ${site.address}<br>Priority: ${site.priority}`);
    });
}

function generateSampleSites(count) {
    const cities = [
        { name: 'Derby', lat: 52.9225, lng: -1.4746 },
        { name: 'Nottingham', lat: 52.9548, lng: -1.1581 },
        { name: 'Leicester', lat: 52.6369, lng: -1.1398 },
        { name: 'Burton upon Trent', lat: 52.8067, lng: -1.6420 },
        { name: 'Ashbourne', lat: 53.0167, lng: -1.7333 },
        { name: 'Belper', lat: 53.0238, lng: -1.4812 },
        { name: 'Ilkeston', lat: 52.9709, lng: -1.3088 },
        { name: 'Long Eaton', lat: 52.8985, lng: -1.2714 },
        { name: 'Alfreton', lat: 53.0979, lng: -1.3837 },
        { name: 'Ripley', lat: 53.0433, lng: -1.4072 },
        { name: 'Heanor', lat: 53.0132, lng: -1.3538 },
        { name: 'Swadlincote', lat: 52.7740, lng: -1.5570 },
        { name: 'Melton Mowbray', lat: 52.7661, lng: -0.8869 },
        { name: 'Loughborough', lat: 52.7721, lng: -1.2062 },
        { name: 'Coalville', lat: 52.7225, lng: -1.3702 },
        { name: 'Castle Donington', lat: 52.8429, lng: -1.3416 }
    ];
    
    const priorities = ['high', 'medium', 'low'];
    const sites = [];
    
    for (let i = 1; i <= count; i++) {
        const city = cities[Math.floor(Math.random() * cities.length)];
        // Generate random location near the city center
        const lat = city.lat + (Math.random() * 0.1 - 0.05);
        const lng = city.lng + (Math.random() * 0.1 - 0.05);
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        
        sites.push({
            id: `SC-${i.toString().padStart(3, '0')}`,
            address: `${Math.floor(Math.random() * 100) + 1} ${['Main', 'High', 'Station', 'Market', 'Church'][Math.floor(Math.random() * 5)]} St, ${city.name}`,
            city: city.name,
            nextCleaning: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
            priority: priority,
            lat: lat,
            lng: lng
        });
    }
    
    return sites;
}

function loadSitesList() {
    const cityFilter = document.getElementById('city-filter').value;
    const searchTerm = document.getElementById('site-search').value.toLowerCase();
    
    // In a real app, this would fetch from an API with pagination
    const allSites = generateSampleSites(totalSites);
    
    // Filter sites
    let filteredSites = allSites;
    
    if (cityFilter !== 'all') {
        filteredSites = filteredSites.filter(site => site.city.toLowerCase() === cityFilter);
    }
    
    if (searchTerm) {
        filteredSites = filteredSites.filter(site => 
            site.id.toLowerCase().includes(searchTerm) || 
            site.address.toLowerCase().includes(searchTerm)
        );
    }
    
    // Update pagination info
    totalSites = filteredSites.length;
    const totalPages = Math.ceil(totalSites / sitesPerPage);
    document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
    
    // Enable/disable pagination buttons
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
    
    // Get current page sites
    const startIdx = (currentPage - 1) * sitesPerPage;
    const endIdx = startIdx + sitesPerPage;
    const pageSites = filteredSites.slice(startIdx, endIdx);
    
    // Render sites
    const sitesList = document.getElementById('sites-list');
    sitesList.innerHTML = '';
    
    pageSites.forEach(site => {
        const siteElement = document.createElement('div');
        siteElement.className = `site-item ${site.priority}-priority ${Math.random() < 0.1 ? 'your-shift' : ''}`;
        siteElement.innerHTML = `
            <span class="site-id">${site.id}</span>
            <span class="site-address">${site.address}</span>
            <span class="site-next-cleaning">${site.nextCleaning}</span>
            <span class="site-priority">${site.priority.charAt(0).toUpperCase() + site.priority.slice(1)}</span>
        `;
        sitesList.appendChild(siteElement);
    });
}

function changePage(delta) {
    const newPage = currentPage + delta;
    const totalPages = Math.ceil(totalSites / sitesPerPage);
    
    if (newPage > 0 && newPage <= totalPages) {
        currentPage = newPage;
        loadSitesList();
    }
}

// Shift Allocation Functions
function initShiftAllocation() {
    // Set up event listeners
    document.getElementById('apply-shift-filters').addEventListener('click', loadShiftCalendar);
    document.getElementById('prev-week').addEventListener('click', () => changeWeek(-1));
    document.getElementById('next-week').addEventListener('click', () => changeWeek(1));
    
    // Initialize calendar
    loadShiftCalendar();
}

let currentWeekOffset = 0;

function loadShiftCalendar() {
    const dateFilter = document.getElementById('shift-date-filter').value;
    const cityFilter = document.getElementById('shift-city-filter').value;
    const radiusFilter = document.getElementById('shift-radius-filter').value;
    
    // Calculate the current week
    const today = new Date();
    const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + currentWeekOffset * 7);
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay() + (currentDate.getDay() === 0 ? -6 : 1)); // Start on Monday
    
    document.getElementById('current-week').textContent = `Week of ${weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    
    // Generate calendar days
    const calendarGrid = document.getElementById('shift-calendar');
    calendarGrid.innerHTML = '';
    
    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + i);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        if (i === new Date().getDay() - 1 && currentWeekOffset === 0) {
            dayElement.classList.add('active');
        }
        if (Math.random() > 0.3) {
            dayElement.classList.add('has-shifts');
        }
        
        dayElement.innerHTML = `
            <div class="day-name">${dayDate.toLocaleDateString('en-GB', { weekday: 'short' })}</div>
            <div class="day-number">${dayDate.getDate()}</div>
        `;
        
        dayElement.addEventListener('click', () => {
            document.querySelectorAll('.calendar-day').forEach(day => day.classList.remove('active'));
            dayElement.classList.add('active');
            loadShiftOptions(dayDate);
        });
        
        calendarGrid.appendChild(dayElement);
    }
    
    // Load shifts for today by default
    loadShiftOptions(new Date());
}

function loadShiftOptions(date) {
    document.getElementById('selected-shift-date').textContent = date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    
    // In a real app, this would fetch from an API based on filters
    const shiftOptions = [
        { id: 'SH-001', time: '08:00 - 12:00', site: 'SC-001 - 123 Clean St, Derby', distance: '1.2 miles', city: 'Derby' },
        { id: 'SH-002', time: '09:00 - 13:00', site: 'SC-002 - 456 Fresh Ave, Derby', distance: '2.5 miles', city: 'Derby' },
        { id: 'SH-003', time: '10:00 - 14:00', site: 'SC-003 - 789 Tidy Rd, Nottingham', distance: '12.8 miles', city: 'Nottingham' },
        { id: 'SH-004', time: '13:00 - 17:00', site: 'SC-004 - 101 Sparkle Ln, Leicester', distance: '24.3 miles', city: 'Leicester' },
        { id: 'SH-005', time: '14:00 - 18:00', site: 'SC-005 - 202 Polish Blvd, Burton upon Trent', distance: '8.7 miles', city: 'Burton upon Trent' },
    ];
    
    const cityFilter = document.getElementById('shift-city-filter').value;
    const radiusFilter = document.getElementById('shift-radius-filter').value;
    
    // Filter shifts (simplified for demo)
    let filteredShifts = shiftOptions;
    
    if (cityFilter !== 'all') {
        filteredShifts = filteredShifts.filter(shift => shift.city === cityFilter);
    }
    
    if (radiusFilter !== 'all') {
        const maxDistance = parseInt(radiusFilter);
        filteredShifts = filteredShifts.filter(shift => {
            const distance = parseFloat(shift.distance.split(' ')[0]);
            return distance <= maxDistance;
        });
    }
    
    // Render shift options
    const shiftOptionsContainer = document.getElementById('shift-options');
    shiftOptionsContainer.innerHTML = '';
    
    if (filteredShifts.length === 0) {
        shiftOptionsContainer.innerHTML = '<div class="no-shifts">No shifts available for the selected filters</div>';
        return;
    }
    
    filteredShifts.forEach(shift => {
        const shiftElement = document.createElement('div');
        shiftElement.className = 'shift-option';
        shiftElement.innerHTML = `
            <div class="time">${shift.time}</div>
            <div class="site">${shift.site}</div>
            <div class="distance">${shift.distance}</div>
            <div class="action"><button>Pick Shift</button></div>
        `;
        
        shiftElement.querySelector('button').addEventListener('click', function() {
            alert(`Shift ${shift.id} picked successfully!`);
            shiftElement.classList.add('selected');
        });
        
        shiftOptionsContainer.appendChild(shiftElement);
    });
}

function changeWeek(delta) {
    currentWeekOffset += delta;
    loadShiftCalendar();
}

// Analytics Functions
function initAnalytics() {
    // Set up event listener
    document.getElementById('analytics-timeframe').addEventListener('change', loadAnalyticsCharts);
    
    // Load initial charts
    loadAnalyticsCharts();
}

function loadAnalyticsCharts() {
    const timeframe = document.getElementById('analytics-timeframe').value;
    
    // Job Types Chart
    const jobTypesCtx = document.getElementById('job-types-chart').getContext('2d');
    new Chart(jobTypesCtx, {
        type: 'doughnut',
        data: {
            labels: ['Office Cleaning', 'Industrial Cleaning', 'Residential Cleaning', 'Deep Cleaning', 'Window Cleaning'],
            datasets: [{
                data: [35, 25, 20, 15, 5],
                backgroundColor: [
                    '#2c8a8a',
                    '#3ab8b8',
                    '#48bb78',
                    '#ed8936',
                    '#f56565'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                }
            }
        }
    });
    
    // Priority Analysis Chart
    const priorityCtx = document.getElementById('priority-chart').getContext('2d');
    new Chart(priorityCtx, {
        type: 'bar',
        data: {
            labels: ['Derby', 'Nottingham', 'Leicester', 'Burton', 'Ashbourne', 'Belper', 'Ilkeston', 'Long Eaton', 'Alfreton', 'Ripley', 'Heanor', 'Swadlincote', 'Melton', 'Loughborough', 'Coalville', 'Castle Donington'],
            datasets: [
                {
                    label: 'High Priority',
                    data: [12, 8, 7, 5, 3, 4, 6, 5, 4, 3, 4, 3, 2, 6, 3, 2],
                    backgroundColor: '#f56565'
                },
                {
                    label: 'Medium Priority',
                    data: [18, 12, 10, 8, 5, 6, 8, 7, 6, 5, 6, 5, 4, 8, 5, 4],
                    backgroundColor: '#ed8936'
                },
                {
                    label: 'Low Priority',
                    data: [25, 18, 15, 12, 8, 10, 12, 10, 8, 7, 8, 7, 6, 12, 7, 6],
                    backgroundColor: '#48bb78'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true,
                    beginAtZero: true
                }
            }
        }
    });
    
    // City Performance Chart
    const cityPerformanceCtx = document.getElementById('city-performance-chart').getContext('2d');
    new Chart(cityPerformanceCtx, {
        type: 'radar',
        data: {
            labels: ['Completion Rate', 'On-Time Rate', 'Quality Score', 'Customer Rating', 'Repeat Business'],
            datasets: [
                {
                    label: 'Derby',
                    data: [95, 92, 89, 4.7, 88],
                    backgroundColor: 'rgba(44, 138, 138, 0.2)',
                    borderColor: 'rgba(44, 138, 138, 1)',
                    pointBackgroundColor: 'rgba(44, 138, 138, 1)'
                },
                {
                    label: 'Nottingham',
                    data: [92, 89, 87, 4.6, 85],
                    backgroundColor: 'rgba(58, 184, 184, 0.2)',
                    borderColor: 'rgba(58, 184, 184, 1)',
                    pointBackgroundColor: 'rgba(58, 184, 184, 1)'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 50,
                    suggestedMax: 100
                }
            }
        }
    });
    
    // Shift Coverage Chart
    const shiftCoverageCtx = document.getElementById('shift-coverage-chart').getContext('2d');
    new Chart(shiftCoverageCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'Shifts Available',
                    data: [120, 135, 150, 145, 160, 155, 170, 165, 160, 175, 170, 185],
                    borderColor: '#2c8a8a',
                    backgroundColor: 'rgba(44, 138, 138, 0.1)',
                    fill: true
                },
                {
                    label: 'Shifts Filled',
                    data: [110, 125, 140, 130, 145, 140, 155, 150, 145, 160, 155, 170],
                    borderColor: '#3ab8b8',
                    backgroundColor: 'rgba(58, 184, 184, 0.1)',
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
    
    // Performance Trend Chart
    const performanceTrendCtx = document.getElementById('performance-trend-chart').getContext('2d');
    new Chart(performanceTrendCtx, {
        type: 'bar',
        data: {
            labels: ['Derby', 'Nottingham', 'Leicester', 'Burton', 'Ashbourne', 'Belper', 'Ilkeston', 'Long Eaton', 'Alfreton', 'Ripley', 'Heanor', 'Swadlincote', 'Melton', 'Loughborough', 'Coalville', 'Castle Donington'],
            datasets: [
                {
                    label: 'Completion Rate (%)',
                    data: [95, 92, 91, 90, 89, 88, 87, 86, 85, 84, 83, 82, 81, 80, 79, 78],
                    backgroundColor: '#2c8a8a',
                    yAxisID: 'y'
                },
                {
                    label: 'Customer Rating (out of 5)',
                    data: [4.7, 4.6, 4.6, 4.5, 4.5, 4.4, 4.4, 4.3, 4.3, 4.2, 4.2, 4.1, 4.1, 4.0, 4.0, 3.9],
                    backgroundColor: '#3ab8b8',
                    type: 'line',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    min: 75,
                    max: 100
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    min: 3.5,
                    max: 5,
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
    
    // Priority Sites List
    const prioritySitesList = document.getElementById('priority-sites-list');
    prioritySitesList.innerHTML = '';
    
    const prioritySites = [
        { id: 'SC-042', address: '15 High St, Derby', priority: 'high', daysOverdue: 3 },
        { id: 'SC-128', address: '22 Market Sq, Nottingham', priority: 'high', daysOverdue: 2 },
        { id: 'SC-356', address: '8 Station Rd, Leicester', priority: 'medium', daysOverdue: 1 },
        { id: 'SC-712', address: '45 Church St, Burton upon Trent', priority: 'medium', daysOverdue: 1 },
        { id: 'SC-201', address: '3 Main Ave, Ashbourne', priority: 'low', daysOverdue: 0 },
        { id: 'SC-543', address: '67 Park Ln, Belper', priority: 'high', daysOverdue: 4 },
        { id: 'SC-876', address: '12 School St, Ilkeston', priority: 'medium', daysOverdue: 1 },
        { id: 'SC-321', address: '9 Factory Rd, Long Eaton', priority: 'low', daysOverdue: 0 },
        { id: 'SC-654', address: '31 Hill Top, Alfreton', priority: 'medium', daysOverdue: 1 },
        { id: 'SC-987', address: '5 Valley Dr, Ripley', priority: 'low', daysOverdue: 0 }
    ];
    
    prioritySites.forEach(site => {
        const siteElement = document.createElement('div');
        siteElement.className = `priority-site ${site.priority}`;
        siteElement.innerHTML = `
            <span class="priority">${site.priority.charAt(0).toUpperCase() + site.priority.slice(1)}</span>
            <span class="site-info">${site.id} - ${site.address}</span>
            <span class="overdue">${site.daysOverdue > 0 ? `${site.daysOverdue} day(s) overdue` : 'On schedule'}</span>
        `;
        prioritySitesList.appendChild(siteElement);
    });
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}