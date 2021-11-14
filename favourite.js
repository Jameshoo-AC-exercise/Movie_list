const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = JSON.parse(localStorage.getItem('favouriteMovies')) || []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

function renderMovieList(data) {
  let rawHTML = ''

  data.forEach(item => {
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img class="card-img-top" src="${POSTER_URL + item.image}"
              alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button type="button" class="btn btn-primary btn-movie-more" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
              <button type="button" class="btn btn-info btn-movie-favourite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `
  });
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    console.log(data)
    modalTitle.innerText = data.title
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}"
                alt="Movie Modal Poster" class="img-fluid">`
    modalDate.innerText = "Release date: " + data.release_date
    modalDescription.innerText = data.description
  })
}

function removeFromFavourite(id) {
  const movieIndex = movies.findIndex(movie => movie.id === id)
  movies.splice(movieIndex, 1)
  localStorage.setItem('favouriteMovies', JSON.stringify(movies))
  renderMovieList(movies)
}

dataPanel.addEventListener('click', function onPanelClick(event) {
  const target = event.target
  if (target.matches('.btn-movie-more')) {
    showMovieModal(Number(target.dataset.id))
  } else if (target.matches('.btn-movie-delete')) {
    removeFromFavourite(Number(target.dataset.id))
  }
})

renderMovieList(movies)

