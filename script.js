// Simulated Database
let items = [];
const userStorageKey = 'user_credentials';

// Show registration page
function showRegistration() {
    document.getElementById('admin-login').classList.add('hidden');
    document.getElementById('password-reset').classList.add('hidden');
    document.getElementById('registration').classList.remove('hidden');
}

// Show login page
function showLogin() {
    document.getElementById('registration').classList.add('hidden');
    document.getElementById('password-reset').classList.add('hidden');
    document.getElementById('admin-login').classList.remove('hidden');
}

// Show password reset page
function showPasswordReset() {
    document.getElementById('admin-login').classList.add('hidden');
    document.getElementById('password-reset').classList.remove('hidden');
    document.getElementById('registration').classList.add('hidden');
}

// Register new user
function register() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const errorElement = document.getElementById('reg-error');

    if (username && password) {
        const existingUsers = JSON.parse(localStorage.getItem(userStorageKey)) || [];
        if (existingUsers.find(user => user.username === username)) {
            errorElement.textContent = 'Username already exists';
        } else {
            existingUsers.push({ username, password });
            localStorage.setItem(userStorageKey, JSON.stringify(existingUsers));
            errorElement.textContent = '';
            showLogin();
        }
    } else {
        errorElement.textContent = 'Please enter all details';
    }
}

// Handle login
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('login-error');

    const users = JSON.parse(localStorage.getItem(userStorageKey)) || [];

    if (users.some(user => user.username === username && user.password === password)) {
        document.getElementById('admin-login').classList.add('hidden');
        document.getElementById('main-page').classList.remove('hidden');
        loadItems();
    } else {
        errorElement.textContent = 'Invalid username or password';
    }
}

// Reset password
function resetPassword() {
    const username = document.getElementById('reset-username').value;
    const newPassword = document.getElementById('new-password').value;
    const errorElement = document.getElementById('reset-error');

    const users = JSON.parse(localStorage.getItem(userStorageKey)) || [];
    const user = users.find(user => user.username === username);

    if (user && newPassword) {
        user.password = newPassword;
        localStorage.setItem(userStorageKey, JSON.stringify(users));
        errorElement.textContent = 'Password reset successfully';
        showLogin();
    } else if (!user) {
        errorElement.textContent = 'Username not found';
    } else {
        errorElement.textContent = 'Please enter a new password';
    }
}

// Add item
function addItem() {
    const name = document.getElementById('item-name').value;
    const expiryDate = document.getElementById('expiry-date').value;
    
    if (name && expiryDate) {
        items.push({ name, expiryDate });
        saveItems();
        document.getElementById('item-name').value = '';
        document.getElementById('expiry-date').value = '';
        displayNotifications();
    }
}

// Save items to local storage
function saveItems() {
    localStorage.setItem('items', JSON.stringify(items));
}

// Load items from local storage
function loadItems() {
    const storedItems = localStorage.getItem('items');
    if (storedItems) {
        items = JSON.parse(storedItems);
    }
    displayItems();
}

// Display notifications
function displayNotifications() {
    const notification = document.getElementById('notification');
    const now = new Date();
    let message = '';
    
    items.forEach(item => {
        const expiryDate = new Date(item.expiryDate);
        const diffTime = expiryDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            message += `<div class="med-expired"><span class="med-icon">❌</span>${item.name} - Expired</div>`;
        } else if (diffDays <= 15) {
            message += `<div class="med-expiring"><span class="med-icon">⚠️</span>${item.name} - Expiring soon (${diffDays} days)</div>`;
        }
    });
    
    notification.innerHTML = message;
}

// Display items in the item details page
function displayItems() {
    const itemList = document.getElementById('item-list');
    itemList.innerHTML = '';

    if (items.length === 0) {
        itemList.innerHTML = '<p>No items found.</p>';
        return;
    }

    // Sort items by expiry date
    items.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

    let expiredItemsHTML = '<h3>Expired Drugs / Inventory Items</h3>';
    let expiringSoonItemsHTML = '<h3>Short Expiry Drugs / Inventory Items</h3><h4>Within 6 Months</h4>';
    let expiringSoon1YearHTML = '<h4>Within 1 Year</h4>';
    let longExpiryItemsHTML = '<h3>Long Expiry Drugs / Inventory Items</h3>';

    items.forEach(item => {
        const expiryDate = new Date(item.expiryDate);
        const now = new Date();
        const diffTime = expiryDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const itemHTML = `
            <div class="med-details">
                <div class="details-info">${item.name} - ${expiryDate.toDateString()}</div>
                <div class="details-buttons">
                    <button class="edit-button" onclick="editItem('${item.name}')">Edit</button>
                    <button class="delete-button" onclick="deleteItem('${item.name}')">Delete</button>
                </div>
            </div>
        `;

        if (diffDays < 0) {
            expiredItemsHTML += `<div class="med-expired">${itemHTML}</div>`;
        } else if (diffDays <= 180) { // 6 months
            expiringSoonItemsHTML += `<div class="med-expiring-within-6-months">${itemHTML}</div>`;
        } else if (diffDays <= 365) { // 1 year
            expiringSoon1YearHTML += `<div class="med-expiring-within-1-year">${itemHTML}</div>`;
        } else {
            longExpiryItemsHTML += `<div class="med-other">${itemHTML}</div>`;
        }
    });

    itemList.innerHTML = `
        <div class="med-expired-section">${expiredItemsHTML}</div>
        <div class="med-expiring-section">
            ${expiringSoonItemsHTML}
            ${expiringSoon1YearHTML}
        </div>
        <div class="med-other-section">${longExpiryItemsHTML}</div>
    `;
}

// View item details page
function viewItemDetails() {
    document.getElementById('main-page').classList.add('hidden');
    document.getElementById('item-details').classList.remove('hidden');
    displayItems();
}

// Go back to main page
function goBack() {
    document.getElementById('item-details').classList.add('hidden');
    document.getElementById('main-page').classList.remove('hidden');
}

// Edit item
function editItem(itemName) {
    const newName = prompt('Enter new name for the item:', itemName);
    if (newName) {
        const index = items.findIndex(item => item.name === itemName);
        if (index !== -1) {
            items[index].name = newName;
            saveItems();
            displayItems();
        }
    }
}

// Delete item
function deleteItem(itemName) {
    items = items.filter(item => item.name !== itemName);
    saveItems();
    displayItems();
}

// Show FAQ
function showFAQ() {
    alert(`Expiry Reminder App Says,
- How to use the app:
  1. Login with admin credentials.
  2. Add new items with their expiry dates.
  3. View item details to see the list of items.
  4. Edit or delete items from the list.
  5. Notifications will alert about expired or soon-to-expire items.
  
- Symbols:
  ❌ - Expired items
  ⚠️ - Items expiring soon

- Sections:
  Red - Expired Drugs / Inventory Items
  Yellow - Short Expiry Drugs / Inventory Items
  Orange - Expiring within 6 months
  Purple - Expiring within 1 year
  Green - Long Expiry Drugs / Inventory Items

- Share button allows you to share the app link via email, social media, and other platforms.`);
}

// Share app link
function shareApp() {
    const shareText = "Check out the Expiry Reminder App!";
    const shareUrl = window.location.href; // or a specific link to your app

    if (navigator.share) {
        navigator.share({
            title: 'Expiry Reminder App',
            text: shareText,
            url: shareUrl,
        }).then(() => {
            console.log('Successful share');
        }).catch(error => {
            console.error('Error sharing:', error);
        });
    } else {
        // Fallback for browsers that do not support the Web Share API
        const tempInput = document.createElement('input');
        document.body.appendChild(tempInput);
        tempInput.value = `${shareText} ${shareUrl}`;
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        alert('App link copied to clipboard. Share it via email, social media, etc.');
    }
}

// Logout
function logout() {
    localStorage.removeItem('loggedIn');
    document.getElementById('main-page').classList.add('hidden');
    document.getElementById('admin-login').classList.remove('hidden');
    items = [];
    saveItems();
}
