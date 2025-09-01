var API = (() => {
  
  var jwtToken;

  var displayErrorMessage = (message) => {
    const errorDiv = document.getElementById("errorMessage");
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
    
    setTimeout(() => {
      errorDiv.style.display = "none";
    }, 3000);
  };

  var validateInput = (title, rating) => {
    if (!title || title.trim() === "") {
      displayErrorMessage("Title is empty");
      return false;
    }

    if (!rating || rating === "") {
      displayErrorMessage("Rating is empty");
      return false;
    }

    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      displayErrorMessage("Rating is invalid");
      return false;
    }

    return true;
  };

  var generateStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  var createFilm = async () => {
    const titleInput = document.getElementById("filmTitle");
    const ratingInput = document.getElementById("filmRating");
    
    const title = titleInput.value.trim();
    const rating = ratingInput.value;

    if (!validateInput(title, rating)) {
      return false;
    }

    try {
      const response = await fetch('http://localhost:8080/api/v1/films', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + jwtToken
        },
        body: JSON.stringify({ 
          name: title,
          rating: parseInt(rating)
        })
      });

      if (response.ok) {
        titleInput.value = ""; 
        ratingInput.value = "";
        alert(`Film "${title}" added!`);
      } else {
        const errorData = await response.json();
        displayErrorMessage(errorData.error || `Error adding film to server: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      displayErrorMessage("Please Login To Enter Film");
    }

    return false;
  };

  var getFilms = async () => {
    const table = document.getElementById("filmTable");
    const tbody = document.getElementById("filmList");

    tbody.innerHTML = "";

    try {
      const response = await fetch('http://localhost:8080/api/v1/films');
      const results = await response.json();

      if (results.length === 0) {
        table.style.display = "none";
      } else {
        table.style.display = "table";

        results.forEach(data => {
          const row = document.createElement("tr");
          const stars = generateStars(data.rating);
          
          row.innerHTML = `
            <td>${data.name}</td>
            <td class="rating">${stars}</td>
          `;
          tbody.appendChild(row);
        });
      }
    } catch (error) {
      displayErrorMessage("Error connecting to server");
    }

    return false;
  };

  var login = () => {
    const val = document.getElementById("login").value;
    if (!val || val.trim() === "") {
        displayErrorMessage("Username is empty");
        return false;
    }
    try {
        fetch("http://localhost:8080/api/v1/login", {
            method: 'POST',
            body: JSON.stringify({
                username: val
            }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        }).then(resp => resp.json())
        .then(data => {
            jwtToken = data.token;
            alert("Login successful!");
        });
    } catch (e) {
        console.log(e);
    }
    return false;
  };

  return {
    createFilm,
    getFilms,
    login
  };
})();