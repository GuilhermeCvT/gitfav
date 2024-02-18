import { GitHubSearch } from "./github-search.js"

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  async add(username) {
    try {
      if(username === '')
        throw new Error('Usuário não preenchido')

      const userExists = this.entries.find(entry => entry.login === username)
      
      if (userExists)
        throw new Error('Usuário já está favoritado')

      const user = await GitHubSearch.search(username)

      if(user.login === undefined)
        throw new Error('Usuário não encontrado')

      this.entries = [user, ...this.entries]
      this.removeAllTr()
      this.update()
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }

  load() {
    this.entries = JSON.parse(localStorage
      .getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
    //Estou salvando um json dos favoritos direto no LocalStorage
  }

  delete(user) {
    const filteredEntries = this.entries
      .filter(entry => entry.login !== user.login)

    this.entries = filteredEntries
    this.removeAllTr()
    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')
    this.empty = document.getElementById("empty-favorite")

    this.removeAllTr()
    this.update()
    this.onAdd()
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach((tr) => {
      tr.remove()
    })
  }

  update() {
    if (this.entries.length == 0){
      this.empty.classList.remove("dont-show")
    } else {
      this.empty.classList.add("dont-show")
    }

    this.entries.forEach(user => {
      const row = this.createRow()

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = `/${user.login}`
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers
      
      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Deseja realmente excluir esse usuário dos favoritos?')
        if(isOk) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
  }

  onAdd() {
    const addButton = this.root.querySelector('.search button')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')
      this.add(value)
    }
  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
    <td class="tb-user">
      <div class="user">
        <img src="https://github.com/username.png" alt="">
        <a href="https://github.com/username" target="_blank">
          <p>User Name</p>
          <span>username</span>
        </a>
      </div>
    </td>
    <td class="repositories">123</td>
    <td class="followers">1234</td>
    <td class="tb-remove"><button class="remove">Remover</button></td>
    `

    return tr
  }
}