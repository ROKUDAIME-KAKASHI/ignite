export const TRIVIA_QUESTIONS = [
  { q: "Who is the supreme head of the Malankara Orthodox Syrian Church?", options: ["The Pope", "Catholicos of the East", "Patriarch of Antioch", "Archbishop of Canterbury"], a: "Catholicos of the East" },
  { q: "Which Apostle is believed to have brought Christianity to Kerala, India?", options: ["St. Peter", "St. Paul", "St. Thomas", "St. Andrew"], a: "St. Thomas" },
  { q: "In what year is St. Thomas believed to have landed in Kerala?", options: ["AD 33", "AD 52", "AD 70", "AD 325"], a: "AD 52" },
  { q: "What is the primary liturgical language traditionally used in the Malankara Orthodox Church?", options: ["Latin", "Greek", "Syriac", "Hebrew"], a: "Syriac" },
  { q: "What is the Holy Communion called in the Orthodox tradition?", options: ["Mass", "Qurbana", "Eucharist", "Liturgy"], a: "Qurbana" },
  { q: "How many sacraments are officially recognized in the Orthodox Church?", options: ["2", "3", "7", "9"], a: "7" },
  { q: "Which ecumenical council is NOT accepted by the Oriental Orthodox Churches?", options: ["Nicaea", "Constantinople", "Ephesus", "Chalcedon"], a: "Chalcedon" },
  { q: "Who is the saint popularly known as 'Parumala Thirumeni'?", options: ["St. Gregorios of Parumala", "St. Dionysius", "St. Baselios", "St. Thomas"], a: "St. Gregorios of Parumala" },
  { q: "What is the 50-day lent before Easter called in the Orthodox Church?", options: ["Advent", "Great Lent", "Nineveh Fast", "Apostles' Fast"], a: "Great Lent" },
  { q: "What is the Syriac word for 'Peace be with you' used in the Liturgy?", options: ["Shlomo", "Aloho", "Barekmor", "Kurielaison"], a: "Shlomo" },
  { q: "What does 'Barekmor' mean?", options: ["Lord have mercy", "Bless, O Lord", "Praise to God", "Peace to you"], a: "Bless, O Lord" },
  { q: "Which council formulated the Nicene Creed?", options: ["Council of Nicaea", "Council of Ephesus", "Council of Trent", "Council of Chalcedon"], a: "Council of Nicaea" },
  { q: "What is the term for the sanctuary in an Orthodox Church?", options: ["Nave", "Madbaha", "Bema", "Narthex"], a: "Madbaha" },
  { q: "Who wrote the majority of the Psalms?", options: ["Solomon", "Moses", "David", "Asaph"], a: "David" },
  { q: "What is the name of the traditional lamp used in Kerala churches?", options: ["Menorah", "Nilavilakku", "Thoookkuvilakku", "Kuthuvilakku"], a: "Nilavilakku" },
  { q: "Which Old Testament prophet was swallowed by a great fish?", options: ["Elijah", "Elisha", "Jonah", "Daniel"], a: "Jonah" },
  { q: "What is the shortest verse in the Bible?", options: ["Jesus wept.", "God is love.", "Pray continually.", "Rejoice always."], a: "Jesus wept." },
  { q: "What does 'Kurielaison' mean?", options: ["Praise the Lord", "Lord, have mercy", "Holy is God", "Glory to God"], a: "Lord, have mercy" },
  { q: "Who was the first Catholicate of the East established in India (1912)?", options: ["Baselios Paulose I", "Baselios Geevarghese I", "Baselios Marthoma Mathews I", "Baselios Marthoma Paulose II"], a: "Baselios Paulose I" },
  { q: "Which fast commemorates the fasting of the people of Nineveh?", options: ["Great Lent", "3 Days Fast (Moonnu Nombu)", "Apostles' Fast", "Assumption Fast"], a: "3 Days Fast (Moonnu Nombu)" },
  { q: "What does 'Orthodox' mean?", options: ["Strict belief", "True Worship/Right Belief", "Ancient way", "Eastern faith"], a: "True Worship/Right Belief" },
  { q: "Who is the mother of Jesus Christ, highly venerated in the Orthodox Church?", options: ["St. Mary (Theotokos)", "St. Elizabeth", "St. Anna", "St. Martha"], a: "St. Mary (Theotokos)" },
  { q: "What is the Syriac word for Holy Spirit?", options: ["Ruho Qadisho", "Sleebo", "Qurbono", "Thronos"], a: "Ruho Qadisho" },
  { q: "What is the traditional vestment worn by Orthodox priests during Qurbana called?", options: ["Kappa", "Phaino", "Kuthoono", "Zunoro"], a: "Phaino" },
  { q: "Where was Jesus born?", options: ["Nazareth", "Jerusalem", "Bethlehem", "Galilee"], a: "Bethlehem" }
];

export function getRandomTrivia() {
  const randomIndex = Math.floor(Math.random() * TRIVIA_QUESTIONS.length);
  return TRIVIA_QUESTIONS[randomIndex];
}

// Ensure array is shuffled if requested as a list
export function getShuffledTrivia() {
  const shuffled = [...TRIVIA_QUESTIONS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
