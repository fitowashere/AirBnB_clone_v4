$(document).ready(function () {
    const HOST = "http://127.0.0.1:5001";
    const amenities = {};
    const cities = {};
    const states = {};

    $('ul li input[type="checkbox"]').bind("change", (e) => {
		const el = e.target;
		let targetObject;
		switch (el.id) {
			case "state_filter":
				targetObject = states;
				break;
			case "city_filter":
				targetObject = cities;
				break;
			case "amenity_filter":
				targetObject = amenities;
				break;
		}
		if (el.checked) {
			targetObject[el.dataset.name] = el.dataset.id;
		} else {
			delete targetObject[el.dataset.name];
		}
		if (el.id === "amenity_filter") {
			$(".amenities h4").text(Object.keys(amenities).sort().join(", "));
		} else {
			$(".locations h4").text(
				Object.keys(Object.assign({}, states, cities)).sort().join(", ")
			);
		}

    });

    // Update API status
    $.getJSON(HOST + "/api/v1/status/", (data) => {
        if (data.status === "OK") {
            $("div#api_status").addClass("available");
        } else {
            $("div#api_status").removeClass("available");
        }
    });

	// search places
	$(".filters button").bind("click", searchPlace);
	searchPlace();

 // fetch places
 function searchPlace() {
    $.post({
      url: `${HOST}/api/v1/places_search`,
      data: JSON.stringify({
        amenities: Object.values(amenities),
        states: Object.values(states),
        cities: Object.values(cities),
      }),
      headers: {
        "Content-Type": "application/json",
      },
      success: (data) => {
        $("section.places").empty();
        data.forEach((d) => console.log(d.id));
        data.forEach((place) => {
          $("section.places").append(
            `<article>
              <div class="title_box">
                <h2>${place.name}</h2>
                <div class="price_by_night">$${place.price_by_night}</div>
              </div>
              <div class="information">
                <div class="max_guest">${place.max_guest} Guest${
              place.max_guest !== 1 ? "s" : ""
            }</div>
                  <div class="number_rooms">${place.number_rooms} Bedroom${
              place.number_rooms !== 1 ? "s" : ""
            }</div>
                  <div class="number_bathrooms">${
                    place.number_bathrooms
                  } Bathroom${place.number_bathrooms !== 1 ? "s" : ""}</div>
              </div> 
              <div class="description">
                ${place.description}
              </div>
              <div class="reviews" data-place="${place.id}">
                <h2>Reviews</h2><span id="toggle_review">show</span>
                <ul style="display: none;"></ul>
              </div>
            </article>`
          );
          fetchReviews(place.id);
        });
      },
      dataType: "json",
    });
  }

  $(document).on('click', '#toggle_review', function() {
    const placeId = $(this).closest('.reviews').data('place');
    const reviewsContainer = $(`.reviews[data-place="${placeId}"]`);
    const reviewsList = reviewsContainer.find('ul');
    const toggleText = reviewsContainer.find('#toggle_review');

    // Toggle visibility of the review list
    if (reviewsList.is(':visible')) {
        reviewsList.hide();
        toggleText.text('show');
    } else {
        // Only fetch reviews if they have not been fetched before
        if (reviewsList.children().length === 0) {
            fetchReviews(placeId);
        }
        reviewsList.show();
        toggleText.text('hide');
    }
});
    function fetchReviews(placeId) {
        const reviewsContainer = $(`.reviews[data-place="${placeId}"]`);
        const reviewsList = reviewsContainer.find("ul");
        $.getJSON(`${HOST}/api/v1/places/${placeId}/reviews`, (reviews) => {
            // Ensure reviews are cleared only when fetching new data
            reviewsList.empty(); 
            reviews.forEach((review) => {
                $.getJSON(`${HOST}/api/v1/users/${review.user_id}`, (user) => {
                    reviewsList.append(`
                        <li>
                            <h3>From ${user.first_name + " " + user.last_name} on ${review.created_at}</h3>
                            <p>${review.text}</p>
                        </li>
                    `);
                });
            });
              }).fail(() => {
            console.error("Failed to fetch reviews.");
        });
    }

});
