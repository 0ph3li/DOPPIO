/* =========================================================
   DOPPIO — data.js (the menu, shared by every page)
   concept, design & code by ghostly.grl ♥
   ========================================================= */
window.DP_DATA = {
  drinks: [
    { id: 'doppio', flap: 'DOPPIO', name: 'doppio', mood: 'monday', price: '€2.80', desc: 'the house rule. two shots, no milk, no small talk until after.' },
    { id: 'amber', flap: 'AMBER', name: 'iced amber latte', mood: 'deadline', price: '€4.90', desc: 'burnt sugar, two shots, oat milk and too much ice, on purpose.' },
    { id: 'berry', flap: 'MATCHA', name: 'berry matcha', mood: 'crush', price: '€5.20', desc: 'ceremonial matcha over berry milk. pink at the bottom, green on top, a mess in between.' },
    { id: 'orange', flap: 'ORANGE', name: 'orange cold brew', mood: 'heatwave', price: '€4.60', desc: 'steeped for 18 hours, poured over fresh orange. tastes like a long weekend.' },
    { id: 'cinnamon', flap: 'CINNAMON', name: 'cinnamon brew', mood: 'rainy day', price: '€4.40', desc: 'double espresso, steamed milk and a cinnamon stick you will not eat.' },
    { id: 'choc', flap: 'CHOCO', name: 'choc layers', mood: '3pm', price: '€5.40', desc: 'chocolate, milk, two shots, cocoa dust. dessert pretending to be coffee.' },
  ],
  // menu.html: four boards, the home drinks plus a few more (img: where the cut-out lives)
  menu: [
    { id: 'coffee', name: 'Coffee', poster: 'Double dose', note: 'pulled twice, always', items: [
      { id: 'doppio', name: 'doppio', price: 2.8, img: 'img/HOME/front/doppio.png', desc: 'the house rule. two shots, no milk, no small talk until after.' },
      { id: 'cortado', name: 'cortado doppio', price: 3.4, img: 'img/MENU/cortado.png', desc: 'two shots cut with warm milk. small glass, big opinions.' },
      { id: 'flat', name: 'flat white', price: 4.2, img: 'img/MENU/flat.png', desc: 'two ristretti under silky milk. the one you order when you mean it.' },
      { id: 'cinnamon', name: 'cinnamon brew', price: 4.4, img: 'img/HOME/front/cinnamon.png', desc: 'double espresso, steamed milk and a cinnamon stick you will not eat.' },
    ] },
    { id: 'matcha', name: 'Matcha', poster: 'Double matcha', note: 'whisked by hand, twice', items: [
      { id: 'berry', name: 'berry matcha', price: 5.2, img: 'img/HOME/front/berry.png', desc: 'ceremonial matcha over berry milk. pink at the bottom, green on top.' },
      { id: 'icedmatcha', name: 'iced matcha', price: 4.8, img: 'img/MENU/icedmatcha.png', desc: 'just matcha, milk and ice. the one that started the festival.' },
      { id: 'cloud', name: 'matcha cloud', price: 5.4, img: 'img/MENU/cloud.png', desc: 'matcha under a cloud of vanilla cold foam. looks like weather.' },
    ] },
    { id: 'cold', name: 'Cold', poster: 'Double cold', note: 'steeped 18 hours', items: [
      { id: 'amber', name: 'iced amber latte', price: 4.9, img: 'img/HOME/front/amber.png', desc: 'burnt sugar, two shots, oat milk and too much ice, on purpose.' },
      { id: 'orange', name: 'orange cold brew', price: 4.6, img: 'img/HOME/front/orange.png', desc: 'steeped for 18 hours, poured over fresh orange. tastes like a long weekend.' },
      { id: 'tonic', name: 'espresso tonic', price: 4.5, img: 'img/MENU/tonic.png', desc: 'two shots over tonic and lemon. it fizzes, then it bites.' },
    ] },
    { id: 'sweet', name: 'Sweet', poster: 'Double sweet', note: 'baked at 6am', items: [
      { id: 'choc', name: 'choc layers', price: 5.4, img: 'img/HOME/front/choc.png', desc: 'chocolate, milk, two shots, cocoa dust. dessert pretending to be coffee.' },
      { id: 'cornetto', name: 'cornetto', price: 1.8, img: 'img/MENU/cornetto.png', desc: 'butter, more butter, crumbs on your laptop. comes in a pair.' },
      { id: 'sandwich', name: 'double sandwich', price: 6.9, img: 'img/MENU/sandwitch.png', desc: 'sourdough, egg, avocado, and a second layer of all of it.' },
      { id: 'cookie', name: 'two cookies', price: 2.5, img: 'img/MENU/cookies.png', desc: 'brown butter, sea salt. you were never getting just one.' },
    ] },
  ],
  sizes: [
    { id: 'doppio', name: 'doppio', add: 0, scale: 1 },
    { id: 'doppiodoppio', name: 'doppio doppio', add: 1.2, scale: 1.12 },
    { id: 'stop', name: 'please stop', add: 2.1, scale: 1.24 },
  ],
  // sospeso.html: cups already waiting on the wall
  wall: [
    { id: 'w1', from: 'giulia', for: 'someone tired', what: 'doppio', time: '07:12' },
    { id: 'w2', from: 'tomás', for: 'table 4', what: 'iced amber latte', time: '07:40' },
    { id: 'w3', from: 'a nurse', for: 'the next nurse', what: 'cortado doppio', time: '07:58' },
    { id: 'w4', from: 'anon', for: 'whoever cried on the tram', what: 'flat white', time: '08:21' },
    { id: 'w5', from: 'nonna rita', for: 'a student', what: 'cornetto', time: '08:44' },
    { id: 'w6', from: 'kai', for: 'you, later', what: 'berry matcha', time: '09:03' },
    { id: 'w7', from: 'the 9am meeting', for: 'the 10am meeting', what: 'doppio', time: '09:30' },
    { id: 'w8', from: 'lea', for: 'no wallet guy', what: 'cinnamon brew', time: '10:15' },
    { id: 'w9', from: 'marco', for: 'a stranger ♥', what: 'orange cold brew', time: '11:02' },
    { id: 'w10', from: 'someone shy', for: 'someone shyer', what: 'two cookies', time: '11:47' },
  ],
  // room.html: what's on at each hour (minutes from midnight)
  day: [
    { from: 0, to: 420, what: 'closed. the machine is sleeping. so should you.', open: false },
    { from: 420, to: 660, what: 'breakfast: a doppio + a cornetto, €4.20', open: true },
    { from: 660, to: 900, what: 'lunch: double sandwich + cold brew, €10', open: true },
    { from: 900, to: 1080, what: '3pm slump: two cookies on us with any doppio', open: true },
    { from: 1080, to: 1260, what: 'aperitivo: espresso tonic, two for €8', open: true },
    { from: 1260, to: 1410, what: 'last doppio at 23:30. decaf, with a look.', open: true },
    { from: 1410, to: 1441, what: 'closing. chairs on tables, one last doppio for the staff.', open: false },
  ],
  // room.html: the floor, four zones with their seats (coordinates in the plan's 800×520 viewBox)
  zones: [
    { id: 'window', name: 'the window bar', note: '8 stools · best for people-watching', seats: [[130, 70], [190, 70], [250, 70], [310, 70], [490, 70], [550, 70], [610, 70], [670, 70]] },
    { id: 'sofa', name: 'the sofa corner', note: '6 seats · nobody leaves before noon', seats: [[80, 200], [80, 250], [80, 300], [150, 340], [200, 340], [250, 340]] },
    { id: 'long', name: 'the long table', note: '14 seats · plugs every 60cm', seats: [[330, 190], [390, 190], [450, 190], [510, 190], [570, 190], [630, 190], [690, 190], [330, 290], [390, 290], [450, 290], [510, 290], [570, 290], [630, 290], [690, 290]] },
    { id: 'two', name: 'the two-seaters', note: '12 seats · for doppio dates', seats: [[380, 380], [420, 380], [520, 380], [560, 380], [660, 380], [700, 380], [380, 420], [420, 420], [520, 420], [560, 420], [660, 420], [700, 420]] },
  ],
  // the second cup goes to one of these when nobody has claimed it yet
  strangers: ["whoever's next", 'someone tired', 'table 4', 'a stranger ♥', 'the next one', 'you, later', 'no wallet guy'],
};
