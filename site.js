/* deploy url. set up apps script with proper code + click deploy as api */
const DRIVE = "";

/* GET
 * get list of people who did not draw their giftee
 * 
 * people are represented as files in a google drive folder, 
 * (when a person draw their giftee, their file is deleted) <- deletion happens in POST func 
 */ 
async function party() {

    // show the input section and hide the result section
    document.getElementById('input-section').style.display = 'block';
    document.getElementById('result-section').style.display = 'none';

    try {
        const response = await fetch(DRIVE, { method: "GET" })
        const data = await response.json()
        party = data.files

        const container = document.getElementById('badge-container');
        party.forEach(member => {
            const div = document.createElement('div');
            div.className = 'badge';
            div.textContent = member;

            div.onclick = () => {
                giftee(member)
                console.log("chamando giftee para:", member);
            };

            container.appendChild(div);
        });
    } catch (error) {
        console.error("Não foi: ", error)
    }
}

/* POST
 * Basically a draw-the-giftee function. 
 *
 * The pool of giftees is a pool of files with the name of each person
 * A person who draw their giftee triggers the deletion of 2 files: 
 * - deletes their own file inside PARTY_FOLDER 
 * - deletes the giftee they drown from GIFTEE_FOLDER
 */
async function giftee(member) {

    // hide the input section and show the result section
    document.getElementById('input-section').style.display = 'none';
    document.getElementById('result-section').style.display = 'block';

    try {
        const response = await fetch(DRIVE, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: member,
        })

        const result = await response.json();
        console.log(result)

        // print result
        const container = document.getElementById('badge-container-res');
        const div = document.createElement('div');
        div.className = 'badge';
        div.textContent = result.giftee;
        container.appendChild(div);

        // console.log("Foi");
    } catch (error) {
        console.log("Não foi: ", error);
    }
}