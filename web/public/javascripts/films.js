var API = (() => {
  
  var jwtToken;
  var editingFilmId = null; // Variable to store the ID of the film being edited

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
      const response = await fetch('http://10.0.0.33:8080/api/v1/films', {
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
      const response = await fetch('http://10.0.0.33:8080/api/v1/films');
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
          // MODIFIED: Add click event to open the edit modal
          row.style.cursor = "pointer";
          row.onclick = () => API.openEditModal(data._id, data.name, data.rating);
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
        fetch("http://10.0.0.33:8080/api/v1/login", {
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

  // NEW: Functions to manage the edit modal
  var openEditModal = (filmId, filmName, currentRating) => {
    editingFilmId = filmId;
    document.getElementById("modalFilmTitle").textContent = filmName;
    document.getElementById("modalFilmRating").value = currentRating;
    document.getElementById("editModal").style.display = "flex";
  };

  var closeEditModal = () => {
    editingFilmId = null;
    document.getElementById("editModal").style.display = "none";
  };
  
  var updateFilmRating = async () => {
    if (!editingFilmId) return;

    const newRating = document.getElementById("modalFilmRating").value;

    try {
      const response = await fetch(`http://10.0.0.33:8080/api/v1/films/${editingFilmId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + jwtToken
        },
        body: JSON.stringify({
          rating: parseInt(newRating)
        })
      });

      if (response.ok) {
        alert("Rating updated successfully!");
        closeEditModal();
        getFilms(); // Refresh the film list
      } else {
        const errorData = await response.json();
        displayErrorMessage(errorData.error || `Error updating rating: ${response.status}`);
      }
    } catch (error) {
      displayErrorMessage("Please log in to update a rating.");
    }
  };

  // MODIFIED: Expose the new functions
  return {
    createFilm,
    getFilms,
    login,
    openEditModal,
    closeEditModal,
    updateFilmRating
  };
})();