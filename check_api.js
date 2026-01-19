
const API_BASE = "https://ll.thespacedevs.com/2.2.0";

async function checkLaunch() {
    try {
        const response = await fetch(`${API_BASE}/launch/upcoming/?limit=5&mode=detailed`, {
            headers: {
                "User-Agent": "Antigravity-Agent/1.0"
            }
        });
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            data.results.forEach((l, i) => {
                console.log(`Launch ${i} Date (NET): ${l.net} - ${l.name}`);
            });
        } else {
            console.log("No launches found.");
        }
    } catch (e) {
        console.error(e);
    }
}

checkLaunch();
