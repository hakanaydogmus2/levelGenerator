import { Scene } from 'phaser';

export class Game extends Scene
{

    constructor ()
    {
        super('Game');
        this.gridSize = 64;
        this.rows = 8;
        this.cols = 8;
        this.offsetX = 512 - (this.cols / 2) * this.gridSize;
        this.offsetY = 384 - (this.rows / 2) * this.gridSize;
        this.words = this.shuffleInPlace(['SEAT', 'EAT', 'TEA', 'SET', 'EAST']);
        this.placedWords = { }; // {words: [SEAT: {S:{x:0,y:0}, E:{x:1,y:0}, A:{x:2,y:0}, T:{x:3,y:0}}, ...]}

    }


    create ()
    {
        this.cameras.main.setBackgroundColor(0xffffff);

        // Refresh butonu
        const refreshButton = this.add.text(900, 700, 'Refresh', { fontSize: '24px', color: '#0000ff' })
            .setInteractive()
            .on('pointerdown', () => {
                this.refreshPuzzle();
            });

        // İlk puzzle üret
        this.generatePuzzle();
    }


    generatePuzzle() {
        // Önce eski grid ve yazıları temizle
        if (this.gridGroup) {
            this.gridGroup.clear(true, true);
        }
        if (this.wordGroup) {
            this.wordGroup.clear(true, true);
        }

        this.gridGroup = this.add.group();
        this.wordGroup = this.add.group();

        // Kelimeleri karıştır
        this.words = this.words;
        this.placedWords = {};

        // Grid çizimi
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                const rect = this.add.rectangle(
                    this.offsetX + i * this.gridSize + this.gridSize / 2,
                    this.offsetY + j * this.gridSize + this.gridSize / 2,
                    this.gridSize - 2,
                    this.gridSize - 2,
                    0xffffff
                ).setStrokeStyle(2, 0x000000);
                this.gridGroup.add(rect);
            }
        }

        // İlk kelimeyi yerleştir
        this.replaceFirstWord();

        // Diğer kelimeleri sırayla yerleştir
        for (let i = 1; i < this.words.length; i++) {
            const word = this.words[i];
            const possiblePositions = this.calculatePossibleWordPositions(word, this.placedWords);

            if (possiblePositions.length > 0) {
                // Rastgele bir yer seç
                const chosenPlacement = this.SelectRandomElement(possiblePositions);
                // chosenPlacement => { "TEA": {T:{x,y},E:{x,y},A:{x,y}, position:'vertical'} }
                const placedWord = Object.keys(chosenPlacement)[0];
                const { position, ...letters } = chosenPlacement[placedWord];

                this.placedWords[placedWord] = {
                    letters,
                    position
                };
            }
        }

        // Kelimeleri göster
        this.displayWordOnGrid(this.placedWords);
    }


    refreshPuzzle() {
        this.generatePuzzle();
    }


    replaceFirstWord(){
        const firstWord = this.words[0];
        const firstWordLetters = firstWord.split('');
        const startX = Math.floor((this.cols - firstWordLetters.length) / 2);
        const startY = Math.floor(this.rows / 2);

        const lettersObj = {};
        firstWordLetters.forEach((letter, index) => {
            lettersObj[letter] = { x: startX + index, y: startY };
        });

        this.placedWords[firstWord] = { letters: lettersObj, position: 'horizontal' };
    }

    calculatePossibleWordPositions(word, currentPlacedWords) {
        const results = [];
        const wordLetters = word.split('');
        const forbidden = this.calculateForbiddenPositions(currentPlacedWords); 
        const forbiddenSet = new Set(forbidden.map(p => `${p.x},${p.y}`));
    
        // Mevcut harflerin konumlarını set olarak topla
        const existingPositions = {};
        Object.values(currentPlacedWords).forEach(wordObj => {
            Object.entries(wordObj.letters).forEach(([letter, pos]) => {
                existingPositions[`${pos.x},${pos.y}`] = letter;
            });
        });
    
        // 1. Ortak harfleri bul
        Object.keys(currentPlacedWords).forEach(placedWord => {
            const { letters } = currentPlacedWords[placedWord];
    
            wordLetters.forEach((letter, wordIndex) => {
                if (letters[letter]) {
                    const { x, y } = letters[letter];
    
                    // --- Dikey yerleştirme ---
                    const verticalPlacement = {};
                    let validVertical = true;
                    let overlapCount = 0;
    
                    for (let i = 0; i < wordLetters.length; i++) {
                        const l = wordLetters[i];
                        const newY = y + (i - wordIndex);
                        const posKey = `${x},${newY}`;
    
                        if (newY < 0 || newY >= this.rows || forbiddenSet.has(posKey)) {
                            validVertical = false;
                            break;
                        }
    
                        if (existingPositions[posKey]) {
                            if (existingPositions[posKey] !== l) {
                                validVertical = false; // farklı harf üst üste gelmiş
                                break;
                            } else {
                                overlapCount++;
                            }
                        }
    
                        verticalPlacement[l] = { x, y: newY };
                    }
    
                    // Eğer sadece 1 harf çakışıyorsa (ortak harf), kabul et
                    if (validVertical && overlapCount <= 1) {
                        results.push({
                            [word]: { ...verticalPlacement, position: 'vertical' }
                        });
                    }
    
                    // --- Yatay yerleştirme ---
                    const horizontalPlacement = {};
                    let validHorizontal = true;
                    let overlapCountH = 0;
    
                    for (let i = 0; i < wordLetters.length; i++) {
                        const l = wordLetters[i];
                        const newX = x + (i - wordIndex);
                        const posKey = `${newX},${y}`;
    
                        if (newX < 0 || newX >= this.cols || forbiddenSet.has(posKey)) {
                            validHorizontal = false;
                            break;
                        }
    
                        if (existingPositions[posKey]) {
                            if (existingPositions[posKey] !== l) {
                                validHorizontal = false;
                                break;
                            } else {
                                overlapCountH++;
                            }
                        }
    
                        horizontalPlacement[l] = { x: newX, y };
                    }
    
                    if (validHorizontal && overlapCountH <= 1) {
                        results.push({
                            [word]: { ...horizontalPlacement, position: 'horizontal' }
                        });
                    }
                }
            });
        });
    
        return results;
    }

    calculateForbiddenPositions(currentPlacedWords){

        const positions = [];
        Object.keys(currentPlacedWords).forEach(word => {
            const { letters, position } = currentPlacedWords[word];
            if (position === 'horizontal') {
                // eğer yatay ise (x artar, y sabit) bu yüzden (x-1,y) ile (x + length(word) -1 ,y) yasak  
                // ilk harfin koordinatları
                const letterKeys = Object.keys(letters);
                const firstLetter = letters[letterKeys[0]];
                const lastLetter = letters[letterKeys[letterKeys.length - 1]];
                console.log(`Yatay kelime: ${word}, yasak pozisyonlar: (${firstLetter.x - 1},${firstLetter.y}) ile (${lastLetter.x + 1},${lastLetter.y})`);

                positions.push({x: firstLetter.x - 1, y: firstLetter.y});
                positions.push({x: lastLetter.x + 1, y: lastLetter.y});
            }
            else if (position === 'vertical') {
                // eğer dikey ise (y artar, x sabit) bu yüzden (x,y-1) ile (x, y + length(word) -1) yasak  
                const letterKeys = Object.keys(letters);
                const firstLetter = letters[letterKeys[0]];
                const lastLetter = letters[letterKeys[letterKeys.length - 1]];
                console.log(`Dikey kelime: ${word}, yasak pozisyonlar: (${firstLetter.x},${firstLetter.y - 1}) ile (${lastLetter.x},${lastLetter.y + 1})`);

                positions.push({x: firstLetter.x, y: firstLetter.y - 1});
                positions.push({x: lastLetter.x, y: lastLetter.y + 1});
            }
        });

        const commonLetters = this.getCommonLettersPosition(currentPlacedWords);
        const letterPositions = new Set();
        Object.values(currentPlacedWords).forEach(wordObj => {
            Object.values(wordObj.letters).forEach(({x, y}) => {
                letterPositions.add(`${x},${y}`);
            });
        });

        commonLetters.forEach(common => {
            const { x, y } = common;

            // Sol-üst ve sağ-üst çaprazleri kontrol et
            const diagonals = [
                { x: x - 1, y: y - 1 }, // sol-üst
                { x: x + 1, y: y - 1 }, // sağ-üst
                { x: x - 1, y: y + 1 }, // sol-alt
                { x: x + 1, y: y + 1 }  // sağ-alt
            ];

            diagonals.forEach(d => {
                let count = 0;

                // Üst ve alt hücrelerde harf var mı kontrol et
                if (letterPositions.has(`${d.x},${d.y - 1}`)) count++;
                if (letterPositions.has(`${d.x},${d.y + 1}`)) count++;
                // Sol ve sağ hücrelerde harf var mı kontrol et
                if (letterPositions.has(`${d.x - 1},${d.y}`)) count++;
                if (letterPositions.has(`${d.x + 1},${d.y}`)) count++;

                // Eğer toplam 2 veya daha fazla harf varsa yasakla
                if (count >= 2) {
                    positions.push({ x: d.x, y: d.y });
                }
            });
        });

        // Tekrar eden pozisyonları önle
        const uniquePositions = [];
        const seen = new Set();
        positions.forEach(pos => {
            const key = `${pos.x},${pos.y}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniquePositions.push(pos);
            }
        });
        console.log('Yasak Pozisyonlar:', uniquePositions);
        return uniquePositions;

    }

    displayWordOnGrid(placedWords) {
        Object.keys(placedWords).forEach(word => {
            const { letters } = placedWords[word]; // letters objesini al
            Object.keys(letters).forEach(letter => {
                const { x, y } = letters[letter]; // her harfin koordinatları
                this.add.text(
                    this.offsetX + x * this.gridSize + this.gridSize / 2,
                    this.offsetY + y * this.gridSize + this.gridSize / 2,
                    letter,
                    { fontSize: '32px', color: '#000' }
                ).setOrigin(0.5);
            });
        });
    }

    getCommonLettersPosition(currentPlacedWords) {
        const positionMap = {}; // { "x,y": ["letter1", "letter2", ...] }

        // Tüm kelimeleri dolaş
        for (const word in currentPlacedWords) {
            const letters = currentPlacedWords[word].letters;
            for (const letter in letters) {
                const pos = letters[letter];
                const key = `${pos.x},${pos.y}`; // pozisyonu string olarak sakla
                if (!positionMap[key]) {
                    positionMap[key] = [];
                }
                positionMap[key].push(letter);
            }
        }

        // Ortak harfleri bul
        const commonPositions = [];
        for (const key in positionMap) {
            if (positionMap[key].length > 1) {
                const [x, y] = key.split(',').map(Number);
                commonPositions.push({ x, y, letters: positionMap[key] });
            }
        }

        return commonPositions;
    }

    getCommonLetters(firstWord, secondWord) {
        const firstLetters = firstWord.letters;
        const secondLetters = secondWord.letters;
        const common = [];

        for (const key in firstLetters) {
            if (secondLetters[key]) {
                common.push({ letter: firstLetters[key], position: key });
            }
        }

        return common;
    
    }

    hasCommonLetters(word1, word2) {
        const letters1 = new Set(Object.keys(word1.letters));
        const letters2 = new Set(Object.keys(word2.letters));

        for (const letter of letters1) {
            if (letters2.has(letter)) {
                return true;
            }
        }

        return false;
    }

    shuffleInPlace(array) {
      for (let i = array.length - 1; i > 0; i--) {
        // 0..i arasında rastgele bir indeks seç
        const j = Math.floor(Math.random() * (i + 1));
        // swap
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    SelectRandomElement(array) {
      const randomIndex = Math.floor(Math.random() * array.length);
      return array[randomIndex];
    }
}
