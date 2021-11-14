const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

let searchList = []
const movies = []

let currentPage = 1

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const displayModePanel = document.querySelector('#display-mode-panel')


// 切換 display 模式的按鈕監聽器， dataset.mode 綁定在 dataPanel 上做切換
displayModePanel.addEventListener('click', function onClickDisplayMode(event) {
  const target = event.target
  if (target.matches('#movie-cards-btn')) {
    dataPanel.dataset.mode = 'card-mode'
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(currentPage))
  } else if (target.matches('#movie-list-btn')) {
    dataPanel.dataset.mode = 'lists-mode'
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(currentPage))
  }
})

// 獲得對應的 data array 后渲染 html 的功能
function renderMovieList(data) {
  let rawHTML = ''

  if (dataPanel.dataset.mode === 'card-mode') {
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

  } else if (dataPanel.dataset.mode === 'lists-mode') {
    // 使用 createElement 搭配 Template Literal
    // const listPanel = document.createElement('div')
    // listPanel.classList.add('list-panel', 'col-12', 'list-group', 'mb-3')
    // data.forEach(item => {
    //   rawHTML += `
    //           <div class="list-group-item d-flex justify-content-between" >
    //               <h5 class="card-title">${item.title}</h5>
    //               <div class="list-button">
    //                   <button type="button" class="btn btn-primary btn-movie-more" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
    //                   <button type="button" class="btn btn-info btn-movie-favourite" data-id="${item.id}">+</button>
    //               </div>
    //           </div>
    //   `
    // });
    // dataPanel.innerHTML = ""
    // listPanel.innerHTML = rawHTML
    // dataPanel.appendChild(listPanel)

    // 完全使用 Template Literal
    rawHTML = `<div class="list-group list-panel col-12 mb-3">`
    data.forEach(item => {
      rawHTML += `
              <div class="list-group-item d-flex justify-content-between">
                  <h5 class="card-title">${item.title}</h5>
                  <div class="list-button">
                      <button type="button" class="btn btn-primary btn-movie-more" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
                      <button type="button" class="btn btn-info btn-movie-favourite" data-id="${item.id}">+</button>
                  </div>
              </div>
      `
    });
    rawHTML += `</div>`
    dataPanel.innerHTML = rawHTML
  }
}

// paginator 數量的 html 渲染功能
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ``
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" data-page="${page}" href="#">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

// 以頁數來獲取相對應的 data array 的功能
function getMoviesByPage(page) {
  const data = searchList.length ? searchList : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

// 點擊 more 並顯示相對應 movie 的 modal
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

// 添加 movie 到 favourite localStorage 裏
function addToFavourite(id) {
  const list = JSON.parse(localStorage.getItem('favouriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)

  if (list.some(movie => movie.id === id)) {
    return alert('This movie have been added already !!!')
  }
  list.push(movie)
  localStorage.setItem('favouriteMovies', JSON.stringify(list))
}

// 點擊 paginator 分頁的監聽器
paginator.addEventListener('click', function onPaginatorClick(event) {
  const target = event.target
  if (target.tagName === "A") {
    currentPage = target.dataset.page
    renderMovieList(getMoviesByPage(currentPage))
  }
})

// 點擊 dataPanel 下 more 或 favourite 的監聽器
dataPanel.addEventListener('click', function onPanelClick(event) {
  const target = event.target
  if (target.matches('.btn-movie-more')) {
    showMovieModal(Number(target.dataset.id))
  } else if (target.matches('.btn-movie-favourite')) {
    addToFavourite(Number(target.dataset.id))
  }
})

// 搜尋的監聽器
searchForm.addEventListener('submit', function onSearchFormSubmit(event) {
  event.preventDefault()
  const input = searchInput.value.trim().toLowerCase()
  searchList = []

  if (!input.length) {
    return alert('Please type the keywords for searching !!!')
  }

  for (const movie of movies) {
    if (movie.title.toLowerCase().includes(input)) {
      searchList.push(movie)
    }
  }

  if (!searchList.length) {
    return alert('Cannot find movies with keyword: ' + input)
  }

  renderPaginator(searchList.length)
  currentPage = 1
  renderMovieList(getMoviesByPage(currentPage))
})

// 網頁一開始的渲染
axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(currentPage))
})
