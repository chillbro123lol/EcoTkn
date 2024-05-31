document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const submitActionForm = document.getElementById('submit-action-form');
    const connectWalletButton = document.getElementById('connect-wallet');

    const apiUrl = 'http://185.254.97.88'; // Update this to your backend URL

    if (registerForm) {
        registerForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const response = await fetch(`${apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                alert('Registration successful!');
                window.location.href = 'login.html';
            } else {
                alert('Error: ' + data.message);
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const response = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);  // Save token to localStorage
                alert('Login successful!');
                window.location.href = 'profile.html';
            } else {
                alert('Error: ' + data.message);
            }
        });
    }

    if (connectWalletButton) {
        connectWalletButton.addEventListener('click', function (event) {
            event.preventDefault();
            if (typeof window.ethereum !== 'undefined') {
                window.ethereum.request({ method: 'eth_requestAccounts' })
                    .then(accounts => {
                        console.log('Connected account:', accounts[0]);
                        alert(`Connected account: ${accounts[0]}`);

                        // Update the current user's MetaMask account
                        let token = localStorage.getItem('token');
                        if (token) {
                            fetch(`${apiUrl}/api/user/updateMetaMaskAccount`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({ metaMaskAccount: accounts[0] })
                            })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.success) {
                                        alert('MetaMask account updated!');
                                        document.getElementById('metaMask-account').textContent = `MetaMask Account: ${accounts[0]}`;
                                    } else {
                                        alert('Error updating MetaMask account.');
                                    }
                                })
                                .catch(error => {
                                    console.error('Error updating MetaMask account', error);
                                    alert('Error updating MetaMask account.');
                                });
                        } else {
                            alert('Please log in first.');
                        }
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
        let token = localStorage.getItem('token');
        if (token) {
            fetch(`${apiUrl}/api/user/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => response.json())
                .then(user => {
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
                })
                .catch(error => {
                    console.error('Error fetching user profile', error);
                    window.location.href = 'login.html';
                });
        } else {
            window.location.href = 'login.html';
        }
    }

    if (submitActionForm) {
        submitActionForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const description = document.getElementById('description').value;
            const proof = document.getElementById('proof').files[0];
            const reader = new FileReader();

            reader.onload = async function (event) {
                const base64Proof = event.target.result;

                let token = localStorage.getItem('token');
                if (token) {
                    const response = await fetch(`${apiUrl}/api/user/submitAction`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ description, proof: base64Proof })
                    });

                    const data = await response.json();
                    if (response.ok) {
                        alert('Submission successful!');
                        window.location.href = 'profile.html';
                    } else {
                        alert('Error: ' + data.message);
                    }
                } else {
                    alert('Please log in first.');
                }
            };

            reader.readAsDataURL(proof);
        });
    }

    const queueList = document.getElementById('queue-list');
    if (queueList) {
        let token = localStorage.getItem('token');
        if (token) {
            fetch(`${apiUrl}/api/admin/getPendingSubmissions`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => response.json())
                .then(users => {
                    queueList.innerHTML = ''; // Clear the list first
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

                                    approveButton.addEventListener('click', function () {
                                        fetch(`${apiUrl}/api/admin/approveSubmission`, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Authorization': `Bearer ${token}`
                                            },
                                            body: JSON.stringify({ userId: user._id, submissionId: submission._id })
                                        })
                                            .then(response => response.json())
                                            .then(data => {
                                                if (data.success) {
                                                    alert('Submission approved and tokens minted!');
                                                    window.location.reload();
                                                } else {
                                                    alert('Error approving submission.');
                                                }
                                            })
                                            .catch(error => {
                                                console.error('Error approving submission', error);
                                                alert('Error approving submission.');
                                            });
                                    });

                                    denyButton.addEventListener('click', function () {
                                        fetch(`${apiUrl}/api/admin/denySubmission`, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Authorization': `Bearer ${token}`
                                            },
                                            body: JSON.stringify({ userId: user._id, submissionId: submission._id })
                                        })
                                            .then(response => response.json())
                                            .then(data => {
                                                if (data.success) {
                                                    alert('Submission denied!');
                                                    window.location.reload();
                                                } else {
                                                    alert('Error denying submission.');
                                                }
                                            })
                                            .catch(error => {
                                                console.error('Error denying submission', error);
                                                alert('Error denying submission.');
                                            });
                                    });

                                    queueList.appendChild(li);
                                }
                            });
                        }
                    });
                })
                .catch(error => {
                    console.error('Error fetching pending submissions', error);
                });
        } else {
            window.location.href = 'login.html';
        }
    }
});
