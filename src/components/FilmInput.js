const FilmInput = ({setFilmNames}) => {
  const defaultVals = `School of Rock
Prisoners
Whiplash
Blues Brothers
The Prestige
The Fly
Interview with the Vampire
The Peanut Butter Falcon
Die Hard
O Brother Where Art Thou
Wild Rose
Do The Right Thing
Mon Oncle
Disobedience
Pretty Woman`;

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
      >
        {defaultVals}
      </textarea>
      <button type="submit">get actors</button>
    </form>
  )
};

export default FilmInput;