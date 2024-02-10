$(document).ready(function () {
    const HOST = "http://127.0.0.1:5001";
    const amenities = {};
    const cities = {};
    const states = {};

    // Using data attributes for filter type identification
    $('ul li input[type="checkbox"]').bind("change", (e) => {
        const el = $(e.target);
        const filterType = el.data("filter"); // Assuming your HTML has `data-filter="state"`, etc.
        let targetObject = { 'state': states, 'city': cities, 'amenity': amenities }[filterType];

        if (el.is(":checked")) {
            targetObject[el.data("name")] = el.data("id");
        } else {
            delete targetObject[el.data("name")];
        }

        if (filterType === "amenity") {
            $(".amenities h4").text(Object.keys(amenities).sort().join(", "));
        } else {
            $(".locations h4").text(
                Object.keys({...states, ...cities}).sort().join(", ")
            );
        }
    });

    // Update API status with error handling
    $.getJSON(HOST + "/api/v1/status/")
        .done((data) => {
            if (data.status === "OK") {
                $("div#api_status").addClass("available");
            } else {
                $("div#api_status").removeClass("available");
            }
        })
        .fail(() => {
            console.error("API status check failed.");
            $("div#api_status").removeClass("available");
        });

    // Function to search and display places
    function searchPlace() {
        $.ajax({
            type: "POST",
            url: `${HOST}/api/v1/places_search`,
            data: JSON.stringify({
                amenities: Object.values(amenities),
                states: Object.values(states),
                cities: Object.values(cities),
            }),
            contentType: "application/json",
            success: (data) => {
                $("section.places").empty();
                data.forEach((place) => {
                    $("section.places").append(
                        `<article>
                            <div class="title_box">
                                <h2>${place.name}</h2>
                                <div class="price_by_night">$${place.price_by_night}</div>
                            </div>
                            <div class="information">
                                <div class="max_guest">${place.max_guest} Guest${place.max_guest !== 1 ? "s" : ""}</div>
                                <div class="number_rooms">${place.number_rooms} Bedroom${place.number_rooms !== 1 ? "s" : ""}</div>
                                <div class="number_bathrooms">${place.number_bathrooms} Bathroom${place.number_bathrooms !== 1 ? "s" : ""}</div>
                            </div>
                            <div class="description">
                                ${place.description}
                            </div>
                            <div class="reviews" data-place="${place.id}">
                                <h2></h2>
                                <ul></ul>
                            </div>
                        </article>`
                    );
                });
            },
            error: (jqXHR, textStatus, errorThrown) => {
                console.error("Failed to fetch places:", textStatus, errorThrown);
            }
        });
    }

    // Bind searchPlace function to the search button
    $(".filters button").bind("click", searchPlace);

    // Perform an initial search on page load
    searchPlace();
});
