// Progressive Enhancement
if(navigator.serviceWorker){
    // Register Sw
    navigator.serviceWorker.register("sw.js").catch(console.error);

    // Message Actions
    const cleanGiphyCacheAction = "cleanGiphyCache";

    // Giphy Cache clean
    function giphyCacheClean(giphys){
        navigator.serviceWorker.getRegistration().then(function(reg){
            // Only post message to active SW
            if(reg.active) {
                reg.active.postMessage({action: cleanGiphyCacheAction, giphys: giphys});
            }
        });
    };
}

// Giphy API object
var giphy = {
    url: 'https://api.giphy.com/v1/gifs/trending',
    query: {
        api_key: 'YieBxXpguJxAh7vxZhqanwZAhAN0g2C8',
        limit: 9
    }
};

// Update trending giphys
function update() {

    // Toggle refresh state
   $('#update .icon').toggleClass('d-none');

    // Call Giphy API
    $.get( giphy.url, giphy.query)

        // Success
        .done( function (res) {

            // Empty Element
            $('#giphys').empty();

            // Initialise array of latest Giphys
            var latestGiphys = [];

            // Loop Giphys
            $.each( res.data, function (i, giphy) {

                var giphyUrl = giphy.images.downsized_large.url;
                var giphyTitle = giphy.title;

                // Add to latest Giphys
                latestGiphys.push(giphyUrl);

                // Add Giphy HTML
                $('#giphys').prepend(
                    '<div class="col-sm-6 col-md-4 col-lg-3 p-1">' +
                        '<img class="w-100 img-fluid" alt="' + giphyTitle + '" src="' + giphyUrl + '">' +
                    '</div>'
                );
            });
            // Inform the SW (if available) of latest Giphys
            if(navigator.serviceWorker) {
                giphyCacheClean(latestGiphys);
            }
        })

        // Failure
        .fail(function(){
            
            $('.alert').slideDown();
            setTimeout( function() { $('.alert').slideUp() }, 2000);
        })

        // Complete
        .always(function() {

            // Re-Toggle refresh state
            $('#update .icon').toggleClass('d-none');
        });

    // Prevent submission if originates from click
    return false;
}

// Manual refresh
$('#update a').click(update);

// Update trending giphys on load
update();
