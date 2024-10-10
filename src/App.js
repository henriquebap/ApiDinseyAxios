
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, Route, BrowserRouter as Router, Routes, useNavigate, useParams } from 'react-router-dom';
import './App.css';

// Componente Principal: Lista de Personagens
function CharacterList() {
  const [characters, setCharacters] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCharacters(currentPage);
  }, [currentPage]);

  const fetchCharacters = (page) => {
    axios
      .get(`https://api.disneyapi.dev/characters?page=${page}&pageSize=50`)
      .then((response) => {
        setCharacters(response.data.data);
        setTotalPages(response.data.info.totalPages);
      })
      .catch((error) => {
        console.error('Erro ao buscar os personagens:', error);
      });
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (search.trim() === '') {
      handleShowAll();
      return;
    }
    axios
      .get(`https://api.disneyapi.dev/character?name=${encodeURIComponent(search.trim())}`)
      .then((response) => {
        if (response.data && response.data.data && response.data.data.length > 0) {
          setCharacters(response.data.data);
          setTotalPages(1);
        } else {
          alert('Nenhum personagem encontrado. Por favor, tente outro nome.');
        }
      })
      .catch((error) => {
        console.error('Erro ao buscar o personagem:', error);
        alert('Erro ao buscar o personagem. Por favor, tente novamente mais tarde.');
      });
  };

  const handleShowAll = () => {
    setSearch('');
    setCurrentPage(1);
    fetchCharacters(1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="character-list-container">
      <h1 className="title">Personagens da Disney</h1>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Pesquisar personagem"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">Pesquisar</button>
        <button type="button" onClick={handleShowAll} className="show-all-button">Mostrar Todos</button>
      </form>
      <ul className="character-list">
        {characters.map((character) => (
          <li key={character._id} className="character-item">
            <Link to={`/character/${character._id}`} className="character-link">
              <h2 className="character-name">{character.name}</h2>
              <img src={character.imageUrl} alt={character.name} className="character-image" />
            </Link>
          </li>
        ))}
      </ul>
      <div className="pagination-buttons">
        <button onClick={handlePreviousPage} disabled={currentPage === 1} className="pagination-button">
          Página Anterior
        </button>
        <button onClick={handleNextPage} disabled={currentPage === totalPages} className="pagination-button">
          Próxima Página
        </button>
      </div>
    </div>
  );
}

// Componente de Detalhes do Personagem
function CharacterDetails() {
  const { id } = useParams();
  const [character, setCharacter] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`https://api.disneyapi.dev/character/${id}`)
      .then((response) => {
        if (response.data && response.data.data) {
          setCharacter(response.data.data);
        } else {
          setError('Personagem não encontrado. Por favor, tente outro nome.');
        }
      })
      .catch((error) => {
        console.error('Erro ao buscar os detalhes do personagem:', error);
        setError('Erro ao buscar os detalhes do personagem. Por favor, verifique o nome e tente novamente.');
      });
  }, [id]);

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="back-button">Voltar à Pesquisa</button>
      </div>
    );
  }

  if (!character) {
    return <p>Carregando...</p>;
  }

  return (
    <div className="character-details-container">
      <h1 className="character-details-name">{character.name}</h1>
      <img src={character.imageUrl} alt={character.name} className="character-details-image" />
      {character.films && character.films.length > 0 && (
        <div className="character-section">
          <h2>Filmes:</h2>
          <ul>
            {character.films.map((film, index) => (
              <li key={index}>{film}</li>
            ))}
          </ul>
        </div>
      )}
      {character.tvShows && character.tvShows.length > 0 && (
        <div className="character-section">
          <h2>Programas de TV:</h2>
          <ul>
            {character.tvShows.map((show, index) => (
              <li key={index}>{show}</li>
            ))}
          </ul>
        </div>
      )}
      {character.parkAttractions && character.parkAttractions.length > 0 && (
        <div className="character-section">
          <h2>Atrações do Parque:</h2>
          <ul>
            {character.parkAttractions.map((attraction, index) => (
              <li key={index}>{attraction}</li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={() => navigate('/')} className="back-button">Voltar à Pesquisa</button>
    </div>
  );
}

// Configuração de Rotas
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CharacterList />} />
        <Route path="/character/:id" element={<CharacterDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
