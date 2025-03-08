document.addEventListener('DOMContentLoaded', function() {
    let user = null;
    // Initial Setup
    const adminDashboard = document.getElementById('admin-dashboard-hidden');
    const listingForm = document.getElementById('listing-form');
    const sellerProfile = document.getElementById('seller-profile');
    const authContainer = document.getElementById('auth-container');
    const loginButton = document.getElementById('login-button');
    const guestLoginButton = document.getElementById('guest-login-button');
    const logoutButton = document.getElementById('logout-button');
    const submitListingButton = document.getElementById('submit-listing');
    const userInfo = document.getElementById('user-info');
    const listingsContainer = document.getElementById('listings-container');
    const createAdminButton = document.getElementById('create-admin-button');

    const identifyObjectsButton = document.getElementById('identify-objects-button');
    const objectDetectionResults = document.getElementById('objectDetectionResults');

    adminDashboard.style.display = 'none';
    listingForm.style.display = 'none';
    sellerProfile.style.display = 'none';
    authContainer.style.display = 'block';
    listingsContainer.style.display = 'none';

    // Sample Listings Data
    const sampleListings = [
        { name: "Old Table", description: "Antique wooden table", price: "$150", location: "New York", contact: "john@example.com" },
        { name: "Vintage Chair", description: "Retro style chair", price: "$75", location: "Los Angeles", contact: "jane@example.com" },
        { name: "Used Bike", description: "Mountain bike in good condition", price: "$200", location: "Chicago", contact: "mike@example.com" }
    ];

    // Initialize Firebase Authentication
    firebase.auth().onAuthStateChanged((firebaseUser) => {
        if (firebaseUser) {
            // User is signed in.
            user = firebaseUser;
        } else {
            // No user is signed in.
            user = null;
        }
        updateUI();
    });

    let isAdmin = false;

    function showListings() {
        listingsContainer.innerHTML = '';
        sampleListings.forEach(listing => {
            const listingDiv = document.createElement('div');
            listingDiv.classList.add('listing-item');
            
            listingDiv.innerHTML = `
                
                <h3>${listing.name}</h3>
                <p>${listing.description}</p>
                <p>Price: ${listing.price}</p>
                <p>Location: ${listing.location}</p>
                <p>Contact: ${listing.contact}</p>
            `;
            listingsContainer.appendChild(listingDiv);
        });
        listingsContainer.style.display = 'grid';
    }

    // Authentication and User Management
     loginButton.addEventListener('click', function() {
        // Sign in with Google
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).then((result) => {
        // The signed-in user info.
        user = result.user;
      }).catch((error) => {
        console.error('Error signing in:', error);
      });
    });

    guestLoginButton.addEventListener('click', function() {
       // Simulate guest login
        user = {
           displayName: "Guest",
           uid: "guest123"
        };
        updateUI();
    });

    logoutButton.addEventListener('click', function() {
        // Sign out
        firebase.auth().signOut().then(() => {
          user = null;
        }).catch((error) => {
          console.error('Error signing out:', error);
        });

    });

    function updateUI() {
        if (user) {
            loginButton.style.display = 'none';
            guestLoginButton.style.display = 'none';
            logoutButton.style.display = 'block';
            userInfo.style.display = 'block';
            userInfo.textContent = isAdmin ? `Welcome, Admin! (${user.displayName})` : `Welcome, ${user.displayName}!`;
            authContainer.style.display = 'none';
            listingsContainer.style.display = 'grid';
            showListings();
        } else {
            loginButton.style.display = 'block';
            guestLoginButton.style.display = 'block';
            logoutButton.style.display = 'none';
            userInfo.style.display = 'none';
            userInfo.textContent = '';
            authContainer.style.display = 'flex';
            adminDashboard.style.display = 'none';
            listingsContainer.style.display = 'none';
        }
    }

    // Navigation and Form Handling

    
    // Add List Item button
    const addListingButton = document.createElement('button');
    addListingButton.id = 'add-listing-button';
    addListingButton.textContent = 'List an Item';
    addListingButton.classList.add('action-button');
    document.body.insertBefore(addListingButton, document.body.firstChild); // Add button to DOM

    addListingButton.addEventListener('click', function() {
        listingForm.style.display = 'block';
        authContainer.style.display = 'none';
        listingsContainer.style.display = 'none';
        sellerProfile.style.display = 'none';
        adminDashboard.style.display = 'none';
    });
    
    // Add profile Button
     const viewProfileButton = document.createElement('button');
    viewProfileButton.id = 'view-profile-button';
    viewProfileButton.textContent = 'View Profile';
    viewProfileButton.classList.add('action-button');
    document.body.insertBefore(viewProfileButton, document.body.firstChild); // Add button to DOM

    viewProfileButton.addEventListener('click', function() {
         sellerProfile.style.display = 'block';
        listingForm.style.display = 'none';
        authContainer.style.display = 'none';
        listingsContainer.style.display = 'none';
        adminDashboard.style.display = 'none'
    });

      document.getElementById('listing-form').addEventListener('click', function(event) {
        if (event.target && event.target.id === 'submit-listing') {
           event.preventDefault();
            const itemImage = document.getElementById('item-image').files[0];
            
              if (!itemImage) {
                    alert("Please upload an image.");
                    return;
                }
            
                // Get image data
                const formData = new FormData();
                formData.append('image', itemImage);

                fetch('/uploadImage', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json'
                    },
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.imageUrl) {
                        const imageUrl = data.imageUrl;

                         // Send the listing data to Firestore
                        const itemName = document.getElementById('item-name').value;
                        const itemDescription = document.getElementById('item-description').value;
                        const itemPrice = document.getElementById('item-price').value;
                        const itemLocation = document.getElementById('item-location').value;
                        const sellerContact = document.getElementById('seller-contact').value;
                        const userData = {
                            userId: user.uid,
                            userDisplayName: user.displayName,
                            userEmail: user.email,
                        }

                        fetch('/submitListing', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                itemName,
                                itemDescription,
                                itemPrice,
                                itemLocation,
                                sellerContact,
                                imageUrl,
                                ...userData
                            })
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            return response.json();
                        })
                        .then(data => {
                            alert("Listing submitted successfully!");
                            document.getElementById('item-name').value = '';
                            document.getElementById('item-description').value = '';
                            document.getElementById('item-price').value = '';
                            document.getElementById('item-location').value = '';
                            document.getElementById('seller-contact').value = '';
                            listingForm.style.display = 'none';
                            listingsContainer.style.display = 'grid';
                        })
                         .catch(error => {
                            console.error('Error submitting listing:', error);
                            alert('Error submitting listing. Please try again.');
                        });
                    } else {
                        throw new Error('Image upload failed.');
                    }
                }).catch(error => {
                    console.error('Error uploading image:', error);
                    alert('Error uploading image. Please try again.');
                });
        }
    });
    //Admin dashboard button
    createAdminButton.addEventListener('click', function() {
           let adminPassword = "adminpassword";
         let password = prompt("Enter admin password");
            if (password === adminPassword) {
                isAdmin = true;
                updateUI();
                adminDashboard.style.display = 'block';
                listingForm.style.display = 'none';
                sellerProfile.style.display = 'none';
                listingsContainer.style.display = 'none'
            } else {
                alert("Incorrect password");
                 isAdmin = false;
                 updateUI();
            }
       
    });

   
    
});