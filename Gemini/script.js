// Google Apps Script URL
// const scriptUrl = 'https://script.google.com/macros/s/AKfycbxe8YsEezU2W8LLHSTGYP6zSSJIxOK55ADZz2QVxOgjiMPMECe_zl8Bj0tbm3bH5-2gzQ/exec';

const scriptUrl = 'https://script.google.com/macros/s/AKfycbxMfClPQAtj5MPPbtm-Dd2iz1ZCkxlZvTDO-o8tY5-NmVPB_p1Cnsf91zdE_GU2-GnqCw/exec';

// Chart.js instance variable
let dailyTrendChart;

// Main document ready function
$(document).ready(function() {
    setupInitialUI();
    initializeComponents();
    setupNavigation();
    initializeChart(); // <-- Initialize chart once
    loadData(); // Initial data load
});

function setupInitialUI() {
    $('#current-date').text(new Date().toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
    }));
}

function initializeComponents() {
    $('.mood-option').click(function() {
        $('.mood-option').removeClass('selected');
        $(this).addClass('selected');
        $('#mood').val($(this).data('mood'));
    });

    $('#increment').click(() => $('#count').val(parseInt($('#count').val()) + 1));
    $('#decrement').click(() => $('#count').val(Math.max(1, parseInt($('#count').val()) - 1)));

    $('#submitLog').click(logEntry);
}

function setupNavigation() {
    $('.nav-item').click(function(e) {
        if ($(this).hasClass('log-button')) return; // Let modal handle its own state
        e.preventDefault();

        $('.nav-item').removeClass('active');
        $(this).addClass('active');
        
        const target = $(this).attr('href');
        $('.content-section').removeClass('active');
        $(target).addClass('active');
    });
}

function logEntry() {
    if (!$('#mood').val()) {
        $('#modal-alert').html('<div class="alert alert-warning">Please select a mood.</div>');
        return;
    }

    const submitBtn = $('#submitLog');
    submitBtn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status"></span> Saving...');

    const data = {
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        count: $('#count').val(),
        mood: $('#mood').val(),
        location: $('#location').val() || '',
    };

    // Use fetch API for a more modern approach
    fetch(scriptUrl, {
        method: 'POST',
        body: new URLSearchParams(data)
    })
    .then(res => res.json())
    .then(response => {
        if (response.result === "success") {
            $('#modal-alert').html('<div class="alert alert-success">Entry logged successfully!</div>');
            setTimeout(() => {
                $('#logModal').modal('hide');
                $('#modal-alert').html('');
                $('#entryForm')[0].reset();
                $('.mood-option').removeClass('selected');
            }, 1500);
            loadData(); // Refresh data after successful log
        } else {
             $('#modal-alert').html(`<div class="alert alert-danger">${response.message || 'An unknown error occurred'}</div>`);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        $('#modal-alert').html('<div class="alert alert-danger">Failed to save. Please check your connection.</div>');
    })
    .finally(() => {
        submitBtn.prop('disabled', false).text('Save');
    });
}

function loadData() {
    // Show a loading indicator (optional but good for UX)
    $('#todayCount').text('...');
    $('#avgDaily').text('...');

    fetch(scriptUrl) // The same URL you use for posting data
        .then(res => {
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            return res.json();
        })
        .then(data => {
            // The data from the spreadsheet is in data.records
            processData(data.records);
        })
        .catch(error => {
            console.error('Error loading data:', error);
            // You can display an error message to the user here
            alert("Could not load data from spreadsheet. Please check your connection and script permissions.");
        });
}

function processData(data) {
    // Today's Count
    const today = new Date().toISOString().split('T')[0];
    const todayCount = data
        .filter(entry => entry.date === today)
        .reduce((sum, entry) => sum + parseInt(entry.count), 0);
    $('#todayCount').text(todayCount);
    
    // Daily Average
    const totalDays = [...new Set(data.map(e => e.date))].length;
    const totalCount = data.reduce((sum, e) => sum + parseInt(e.count), 0);
    const avgDaily = totalDays > 0 ? (totalCount / totalDays).toFixed(1) : 0;
    $('#avgDaily').text(avgDaily);

    // Top Trigger
    const moodCounts = data.reduce((acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + parseInt(entry.count);
        return acc;
    }, {});
    const topTrigger = Object.keys(moodCounts).length > 0 ? Object.entries(moodCounts).sort((a,b) => b[1]-a[1])[0][0] : '--';
    $('#topTrigger').text(topTrigger);

    // History Table
    const historyBody = $('#historyTable tbody');
    historyBody.empty();
    data.slice(0, 15).forEach(entry => { // Show latest 15 entries
        historyBody.append(`
            <tr>
                <td>${new Date(entry.date + 'T' + entry.time).toLocaleString()}</td>
                <td>${entry.count}</td>
                <td><span class="badge bg-secondary">${entry.mood}</span></td>
                <td><button class="btn btn-sm btn-outline-danger"><i class="fas fa-trash"></i></button></td>
            </tr>
        `);
    });

    // --- Prepare data for the chart ---
    const trendLabels = [];
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateString = d.toISOString().split('T')[0];
        trendLabels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
        const dayCount = data
            .filter(entry => entry.date === dateString)
            .reduce((sum, entry) => sum + parseInt(entry.count), 0);
        trendData.push(dayCount);
    }
    // Update the chart with the new data
    updateChartData(trendLabels, trendData);
}

function initializeChart() {
    const ctx = document.getElementById('dailyTrendChart').getContext('2d');
    dailyTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Initial empty data
            datasets: [{
                label: 'Cigarettes per Day',
                data: [], // Initial empty data
                borderColor: '#00ffab',
                backgroundColor: 'rgba(0, 255, 171, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#00ffab',
                pointBorderColor: '#121212',
                pointHoverRadius: 7,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#a0a0a0' }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#a0a0a0' }
                }
            }
        }
    });
}

function updateChartData(labels, data) {
    if (!dailyTrendChart) {
        initializeChart();
    }
    dailyTrendChart.data.labels = labels;
    dailyTrendChart.data.datasets[0].data = data;
    dailyTrendChart.update(); // <-- This is the key to a smooth update
}