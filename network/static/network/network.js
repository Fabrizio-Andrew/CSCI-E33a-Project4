document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#newpost').onclick = () => compose();

    // Load timeline by default
    load_timeline();
});

function compose() {

    // Clear out post field
    document.querySelector('#newpost-content').value = '';

    // Show new post view and
    document.querySelector('#newpost-view').style.display = 'block';

    // Submit post to API endpoint when user clicks "submit"
    document.querySelector('#newpost-form').onsubmit = function() {
        fetch('/newpost', {
            method: 'POST',
            body: JSON.stringify({
                content: document.querySelector('#newpost-content').value
            })
        })
        // Print result
        .then(response => response.json())
        .then(result => {
            console.log(result);
            
            // Hide the new post view
            document.querySelector('#newpost-view').style.display = 'none';
        });
    };
    return false;
}

function load_timeline() {

    // Show timeline view and hide all others
    document.querySelector('#timeline-view').style.display = 'block';
    document.querySelector('#newpost-view').style.display = 'none';

}