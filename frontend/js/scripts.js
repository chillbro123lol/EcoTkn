document.addEventListener('DOMContentLoaded', function() {
    const submitActionForm = document.getElementById('submit-action-form');
    const connectWalletButton = document.getElementById('connect-wallet');
    const fetchSubmissionsButton = document.getElementById('fetch-submissions');
    const submissionsListElement = document.getElementById('submissions-list');
    let userAddress = '';
    //http://localhost:3000
    async function uploadToIPFS(file, description) {
        const formData = new FormData();
        formData.append('proof', file);
        formData.append('description', description);
        formData.append('userWallet', userAddress);

        const response = await fetch('http://localhost:3000/submit-action', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Error uploading proof to IPFS');
        }

        return await response.json();
    }

    async function fetchSubmissionsForUser(userAddress) {
        const response = await fetch(`http://localhost:3000/submissions/${userAddress}`);
        if (!response.ok) {
            alert('No submissions found for this user.');
            return;
        }

        const data = await response.json();
        submissionsListElement.innerHTML = '';
        for (const submissionHash of data.submissions) {
            const submission = await fetchFromIPFS(submissionHash);
            const li = document.createElement('li');
            li.innerHTML = `
                ${submission.description} - Status: ${submission.status} <br>
                <img src="https://harlequin-bright-clam-612.mypinata.cloud/${submission.proof}" alt="Proof" style="max-width: 200px;">
            `;
            submissionsListElement.appendChild(li);
        }
    }

    async function fetchFromIPFS(hash) {
        const response = await fetch(`https://harlequin-bright-clam-612.mypinata.cloud/ipfs/${hash}`);
        if (!response.ok) {
            throw new Error('Error fetching from IPFS');
        }
        return await response.json();
    }

    if (connectWalletButton) {
        connectWalletButton.addEventListener('click', async function(event) {
            event.preventDefault();
            if (typeof window.ethereum !== 'undefined') {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    userAddress = accounts[0];
                    alert(`Connected account: ${userAddress}`);
                    document.getElementById('metaMask-account').textContent = `MetaMask Account: ${userAddress}`;
                } catch (error) {
                    console.error('Error connecting to MetaMask', error);
                    alert('Error connecting to MetaMask. Please try again.');
                }
            } else {
                alert('MetaMask is not installed. Please install MetaMask and try again.');
            }
        });
    }

    if (fetchSubmissionsButton) {
        fetchSubmissionsButton.addEventListener('click', async function() {
            if (!userAddress) {
                alert('Please connect your MetaMask wallet first.');
                return;
            }
            await fetchSubmissionsForUser(userAddress);
        });
    }

    if (submitActionForm) {
        submitActionForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            if (!userAddress) {
                alert('Please connect your MetaMask wallet first.');
                return;
            }

            const description = document.getElementById('description').value;
            const proof = document.getElementById('proof').files[0];

            if (!proof) {
                alert('Please upload a proof file.');
                return;
            }

            try {
                const result = await uploadToIPFS(proof, description);
                alert('Submission successful!');
                //window.location.href = 'profile.html'; // Update this to the correct path if needed
            } catch (error) {
                console.error('Error submitting action:', error);
                alert('Error submitting action. Please try again.');
            }
        });
    }
});
