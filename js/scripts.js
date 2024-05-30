document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const submitActionForm = document.getElementById('submit-action-form');
    const connectWalletButton = document.getElementById('connect-wallet');

    // Initialize users array if not present
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Retrieve existing users
            const users = JSON.parse(localStorage.getItem('users'));

            // Check if the email is already registered
            const existingUser = users.find(user => user.email === email);
            if (existingUser) {
                alert('This email is already registered.');
                return;
            }

            // Add new user to the array
            const newUser = { name: name, email: email, password: password, tokenBalance: 0, metaMaskAccount: '', submissions: [] };
            users.push(newUser);

            // Save updated users array to localStorage
            localStorage.setItem('users', JSON.stringify(users));
            alert('Registration successful!');
            window.location.href = 'login.html';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Retrieve users from localStorage
            const users = JSON.parse(localStorage.getItem('users'));

            // Find the user with matching email and password
            const user = users.find(user => user.email === email && user.password === password);
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                window.location.href = 'profile.html';
            } else {
                alert('Invalid email or password');
            }
        });
    }

    if (connectWalletButton) {
        connectWalletButton.addEventListener('click', function(event) {
            event.preventDefault();
            if (typeof window.ethereum !== 'undefined') {
                window.ethereum.request({ method: 'eth_requestAccounts' })
                    .then(accounts => {
                        console.log('Connected account:', accounts[0]);
                        alert(`Connected account: ${accounts[0]}`);
                        
                        // Update the current user's MetaMask account
                        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
                        currentUser.metaMaskAccount = accounts[0];
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        
                        // Update the users array with the new MetaMask account
                        let users = JSON.parse(localStorage.getItem('users'));
                        const userIndex = users.findIndex(user => user.email === currentUser.email);
                        if (userIndex !== -1) {
                            users[userIndex].metaMaskAccount = accounts[0];
                            localStorage.setItem('users', JSON.stringify(users));
                        }

                        // Update the displayed MetaMask account
                        document.getElementById('metaMask-account').textContent = `MetaMask Account: ${accounts[0]}`;
                    })
                    .catch(error => {
                        console.error('Error connecting to MetaMask', error);
                        alert('Error connecting to MetaMask. Please try again.');
                    });
            } else {
                alert('MetaMask is not installed. Please install MetaMask and try again.');
            }
        });
    }

    const userDetails = document.getElementById('user-details');
    if (userDetails) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user) {
            document.getElementById('user-name').textContent = user.name;
            document.getElementById('user-email').textContent = user.email;
            document.getElementById('token-balance').textContent = user.tokenBalance;

            if (user.metaMaskAccount) {
                document.getElementById('metaMask-account').textContent = `MetaMask Account: ${user.metaMaskAccount}`;
            }

            const submissionsList = document.getElementById('submissions-list');
            submissionsList.innerHTML = ''; // Clear the list first
            user.submissions.forEach(submission => {
                const li = document.createElement('li');
                li.textContent = `${submission.description} - Status: ${submission.status}`;
                submissionsList.appendChild(li);
            });
        } else {
            window.location.href = 'login.html';
        }
    }

    if (submitActionForm) {
        submitActionForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const description = document.getElementById('description').value;
            const proof = document.getElementById('proof').files[0];
            const reader = new FileReader();

            reader.onload = function(event) {
                const base64Proof = event.target.result;

                // Update the current user's submissions
                let currentUser = JSON.parse(localStorage.getItem('currentUser'));
                if (!currentUser.submissions) {
                    currentUser.submissions = [];
                }
                currentUser.submissions.push({ description, proof: base64Proof, status: 'pending' });
                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                // Update the users array with the new submission
                let users = JSON.parse(localStorage.getItem('users'));
                const userIndex = users.findIndex(user => user.email === currentUser.email);
                if (userIndex !== -1) {
                    users[userIndex].submissions = currentUser.submissions;
                    localStorage.setItem('users', JSON.stringify(users));
                }

                alert('Submission successful!');
                window.location.href = 'profile.html';
            };

            reader.readAsDataURL(proof);
        });
    }

    const queueList = document.getElementById('queue-list');
    if (queueList) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        queueList.innerHTML = ''; // Clear the list first
        console.log('Users:', users); // Logging users for debugging

        users.forEach(user => {
            if (user.submissions && user.submissions.length > 0) {
                user.submissions.forEach(submission => {
                    if (submission.status === 'pending') {
                        const li = document.createElement('li');
                        li.innerHTML = `
                            <p>${submission.description}</p>
                            <img src="${submission.proof}" alt="Proof" style="max-width: 200px;">
                            <p>User: ${user.name} - Email: ${user.email}</p>
                            <button class="approve">Approve</button>
                            <button class="deny">Deny</button>
                        `;
                        const approveButton = li.querySelector('.approve');
                        const denyButton = li.querySelector('.deny');

                        approveButton.addEventListener('click', function() {
                            submission.status = 'approved';
                            const userIndex = users.findIndex(u => u.email === user.email);
                            if (userIndex !== -1) {
                                const subIndex = users[userIndex].submissions.findIndex(s => s.description === submission.description && s.proof === submission.proof);
                                if (subIndex !== -1) {
                                    users[userIndex].submissions[subIndex].status = 'approved';
                                    localStorage.setItem('users', JSON.stringify(users));
                                    alert('Submission approved and tokens minted!');
                                    window.location.reload();
                                }
                            }
                        });

                        denyButton.addEventListener('click', function() {
                            submission.status = 'denied';
                            const userIndex = users.findIndex(u => u.email === user.email);
                            if (userIndex !== -1) {
                                const subIndex = users[userIndex].submissions.findIndex(s => s.description === submission.description && s.proof === submission.proof);
                                if (subIndex !== -1) {
                                    users[userIndex].submissions[subIndex].status = 'denied';
                                    localStorage.setItem('users', JSON.stringify(users));
                                    alert('Submission denied!');
                                    window.location.reload();
                                }
                            }
                        });

                        queueList.appendChild(li);
                    }
                });
            }
        });
    }
});
