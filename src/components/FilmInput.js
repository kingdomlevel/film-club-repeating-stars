const FilmInput = ({setFilmNames}) => {
  const getFilms = ev => {
    ev.preventDefault();

    // full paragraph
    const filmsPara = ev.target["films-input"].value;

    // split on new lines + remove any empty
    const filmLines = filmsPara.split(/\r?\n/).filter(line => line);

    setFilmNames(filmLines);
  };

  return (
    <form onSubmit={getFilms}>
      <label htmlFor="films-input">
        Input film names (one per line):
      </label>
      <textarea 
        id="films-input"
        name="films-input"
        rows="16"
        cols="30"
      />
      <button type="submit">get actors</button>
    </form>
  )
};

export default FilmInput;