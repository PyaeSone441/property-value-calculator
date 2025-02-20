console.log("Script Loaded");

// Function to format the payload in a dataframe-like structure
function formatPayload(streetName, flatModel, floorNumber, floorArea, year, month_num, months_remaining_lease) {
    // Storey Range Logic
    const storeyRanges = [
        { range: [4, 6], label: 'storey_range_04 TO 06' },
        { range: [7, 9], label: 'storey_range_07 TO 09' },
        { range: [10, 12], label: 'storey_range_10 TO 12' },
        { range: [13, 15], label: 'storey_range_13 TO 15' },
        { range: [16, 18], label: 'storey_range_16 TO 18' },
        { range: [19, 21], label: 'storey_range_19 TO 21' },
        { range: [22, 24], label: 'storey_range_22 TO 24' },
        { range: [25, 27], label: 'storey_range_25 TO 27' },
        { range: [28, 30], label: 'storey_range_28 TO 30' },
        { range: [31, 33], label: 'storey_range_31 TO 33' },
        { range: [34, 36], label: 'storey_range_34 TO 36' },
        { range: [37, 39], label: 'storey_range_37 TO 39' },
        { range: [40, 42], label: 'storey_range_40 TO 42' },
        { range: [43, 45], label: 'storey_range_43 TO 45' },
        { range: [46, 48], label: 'storey_range_46 TO 48' },
        { range: [49, 51], label: 'storey_range_49 TO 51' }
    ];

    const storeyRangesResult = storeyRanges.reduce((acc, rangeObj) => {
        acc[rangeObj.label] = [floorNumber >= rangeObj.range[0] && floorNumber <= rangeObj.range[1] ? 1 : 0];
        return acc;
    }, {});

    // Flat Type Logic
    const flatTypes = [
        '2 room', '3 room', '4 room', '5 room', 'executive', 'multi generation'
    ];

    const flatTypesResult = flatTypes.reduce((acc, type) => {
        acc[`flat_type_${type.toUpperCase().replace(" ", "_")}`] = [flatModel === type ? 1 : 0];
        return acc;
    }, {});

    // Town Logic
    const towns = [
        'BEDOK', 'BISHAN', 'BUKIT BATOK', 'BUKIT MERAH', 'BUKIT PANJANG', 'BUKIT TIMAH',
        'CENTRAL AREA', 'CHOA CHU KANG', 'CLEMENTI', 'GEYLANG', 'HOUGANG', 'JURONG EAST',
        'JURONG WEST', 'KALLANG/WHAMPOA', 'MARINE PARADE', 'PASIR RIS', 'PUNGGOL', 'QUEENSTOWN',
        'SEMBWANG', 'SENGKANG', 'SERANGOON', 'TAMPINES', 'TOA PAYOH', 'WOODLANDS', 'YISHUN'
    ];

    const townsResult = towns.reduce((acc, town) => {
        acc[`town_${town.replace(/ /g, "_").toUpperCase()}`] = [streetName.toUpperCase().includes(town.toUpperCase()) ? 1 : 0];
        return acc;
    }, {});

    // Final payload in dataframe-like format
    return {
        floor_area_sqm: [parseFloat(floorArea)],
        year: [parseInt(year, 10)],
        month_num: [parseInt(month_num, 10)],
        months_remaining_lease: [parseInt(months_remaining_lease, 10)],
        ...storeyRangesResult,
        ...flatTypesResult,
        ...townsResult
    };
}

// Function to process data
async function processData(event) {
    // Prevent form submission (which reloads the page)
    event.preventDefault();

    // Fixed Values for Proof of Concept
    const year = '2022';
    const month_num = '10';
    const months_remaining_lease = '1188';

    // Extract values from the form fields
    const streetName = document.getElementById("street-name").value;
    const flatModel = document.getElementById("flat-model").value;
    const floorNumber = parseInt(document.getElementById("floor-number").value, 10);
    const unitNumber = document.getElementById("unit-number").value;
    const floorArea = document.getElementById("floor-area").value;

    // Validate inputs
    if (!streetName || !flatModel || isNaN(floorNumber) || !unitNumber || isNaN(floorArea)) {
        alert("All fields are required and must be valid.");
        return;
    }

    // Call formatPayload to construct the payload
    const payload = formatPayload(
        streetName,
        flatModel,
        floorNumber,
        floorArea,
        year,
        month_num,
        months_remaining_lease
    );

    // Log the payload for debugging
    console.log("Formatted Payload (Python DataFrame-like):", JSON.stringify(payload));
    // Send POST request to Flask backend
    try {
        const response = await fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        // Hide the loading spinner
        document.getElementById('loading').classList.add('hidden');

        if (response.ok) {
            const roundedPrediction = Math.floor(result.prediction);
            const formattedPrediction = roundedPrediction.toLocaleString();
            document.getElementById('result').innerText = `Predicted Value: $${formattedPrediction}`;

        } else {
            document.getElementById('result').innerText = `Error: ${result.error}`;
        }
    } catch (error) {
        // Hide the loading spinner and show error
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('result').innerText = `Network Error: ${error.message}`;
    }

}

