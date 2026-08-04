document.addEventListener('DOMContentLoaded', () => {
	const COLORS = ['b', 'r', 'g', 'y', 'p', 'w'];
	const CODE_LENGTH = 4;

	let allPermutations = [];
	let currentCandidates = [];
	let currentSelection = [];
	let history = [];

	const colorPalette = document.getElementById('color-palette');
	const currentSelectionDiv = document.getElementById('current-selection');
	const hitsInput = document.getElementById('hits');
	const blowsInput = document.getElementById('blows');
	const submitButton = document.getElementById('submit-guess');
	const resetButton = document.getElementById('reset-selection');
	const suggestButton = document.getElementById('suggest-guess');
	const historyListDiv = document.getElementById('history-list');
	const candidateCountSpan = document.getElementById('candidate-count');
	const candidatesListUl = document.getElementById('candidates-list');
	const suggestionSection = document.getElementById('suggestion-section');
	const suggestedGuessPegs = document.getElementById('suggested-guess-pegs');


	// --- 初期化 ---
	function init() {
		// 全ての順列を生成
		allPermutations = getPermutations(COLORS, CODE_LENGTH);
		currentCandidates = [...allPermutations];

		setupEventListeners();
		renderCandidates();
		updatePaletteState();
	}

	function setupEventListeners() {
		colorPalette.addEventListener('click', e => {
			if (e.target.classList.contains('color-btn') && !e.target.disabled) {
				const color = e.target.dataset.color;
				if (currentSelection.length < CODE_LENGTH) {
					// 重複を防ぐ
					if (!currentSelection.includes(color)) {
						currentSelection.push(color);
						renderCurrentSelection();
						updatePaletteState();
					}
				}
			}
		});

		resetButton.addEventListener('click', () => {
			currentSelection = [];
			renderCurrentSelection();
			updatePaletteState();
		});

		submitButton.addEventListener('click', () => {
			if (currentSelection.length !== CODE_LENGTH) {
				alert('色を4つ選んでください。');
				return;
			}
			const hits = parseInt(hitsInput.value, 10);
			const blows = parseInt(blowsInput.value, 10);

			if (isNaN(hits) || isNaN(blows) || hits < 0 || blows < 0 || hits + blows > CODE_LENGTH) {
				alert('ヒットとブローの数が正しくありません。');
				return;
			}

			const guess = [...currentSelection];
			history.push({ guess, hits, blows });
			renderHistory();
			updateCandidates(guess, hits, blows);
			
			// 入力と選択をリセット
			currentSelection = [];
			renderCurrentSelection();
			updatePaletteState();
			hitsInput.value = 0;
			blowsInput.value = 0;
			suggestionSection.style.display = 'none';
		});

		suggestButton.addEventListener('click', () => {
			suggestButton.disabled = true;
			suggestButton.textContent = '計算中...';
			suggestionSection.style.display = 'none';

			// UIを更新させてから重い処理を実行
			setTimeout(() => {
				let bestGuess = findBestGuess();
				renderSuggestedGuess(bestGuess);
				
				// 推奨された手をカレントに設定
				currentSelection = bestGuess;
				renderCurrentSelection();
				updatePaletteState();

				suggestButton.disabled = false;
				suggestButton.textContent = '次の手を提案';
			}, 10);
		});
	}

	// --- コアロジック ---

	function getPermutations(array, size) {
		const result = [];
		function generate(current, remaining) {
			if (current.length === size) {
				result.push(current);
				return;
			}
			for (let i = 0; i < remaining.length; i++) {
				const next = remaining[i];
				const newRemaining = remaining.slice(0, i).concat(remaining.slice(i + 1));
				generate(current.concat(next), newRemaining);
			}
		}
		generate([], array);
		return result;
	}

	function calculateHitBlow(secret, guess) {
		let hits = 0;
		let blows = 0;
		const secretCopy = [...secret];
		const guessCopy = [...guess];

		for (let i = CODE_LENGTH - 1; i >= 0; i--) {
			if (secretCopy[i] === guessCopy[i]) {
				hits++;
				secretCopy.splice(i, 1);
				guessCopy.splice(i, 1);
			}
		}

		for (let i = 0; i < guessCopy.length; i++) {
			const foundIndex = secretCopy.indexOf(guessCopy[i]);
			if (foundIndex !== -1) {
				blows++;
				secretCopy.splice(foundIndex, 1);
			}
		}
		return { hits, blows };
	}

	function updateCandidates(guess, hits, blows) {
		currentCandidates = currentCandidates.filter(candidate => {
			const result = calculateHitBlow(candidate, guess);
			return result.hits === hits && result.blows === blows;
		});
		renderCandidates();

		if (currentCandidates.length === 1) {
			//alert(`答えが見つかりました！: ${currentCandidates[0].join('')}`);
			alert(`答えが見つかりました!`);
		}
	}
	
	function calculateEntropy(distribution, total) {
		let entropy = 0;
		for (const count of Object.values(distribution)) {
			const p = count / total;
			if (p > 0) {
				entropy -= p * Math.log2(p);
			}
		}
		return entropy;
	}

	function findBestGuess() {
		//最大のエントロピーをもつ候補を返す -> 最大の「相互情報量」を与える
		//let minEntropy = Infinity;
		let maxEntropy = 0.0;
		let bestGuess = null;

		// 履歴にある手は候補から除外する
		const historyGuessStrings = history.map(h => h.guess.join(''));
		const possibleGuesses = allPermutations.filter(p => !historyGuessStrings.includes(p.join('')));

		for (const guess of possibleGuesses) {
			// 候補の中にこの手がある場合、少し優先する（早く終わる可能性）
			const isCandidate = currentCandidates.some(c => c.join('') === guess.join(''));
			
			const distribution = {};
			for (const candidate of currentCandidates) {
				const { hits, blows } = calculateHitBlow(candidate, guess);
				const key = `${hits},${blows}`;
				distribution[key] = (distribution[key] || 0) + 1;
			}
			
			let entropy = calculateEntropy(distribution, currentCandidates.length);

			// 候補内の手は、エントロピーをわずかに下げることで優先される
			if (isCandidate) {
				entropy -= 0.001;
			}

			//console.log(`${guess}: ${entropy} bit`);

			/*
			if (entropy < minEntropy) {
				minEntropy = entropy;
				bestGuess = guess;
			}
			*/
			if (entropy > maxEntropy){
				maxEntropy = entropy;
				bestGuess = guess;
			}
		}

		//console.log(`bestGuess: ${bestGuess}`);

		// フォールバック: 最適な手が見つからない場合、履歴にない次の手 -> 候補 -> 全ての順列、の順で選択する
		return bestGuess || possibleGuesses[0] || currentCandidates[0] || allPermutations[0];
	}

	// --- UI描画 ---

	function createPegDiv(color, type) {
		const peg = document.createElement('div');
		peg.className = `${type} peg-${color}`;
		return peg;
	}
	
	function updatePaletteState() {
		const buttons = colorPalette.querySelectorAll('.color-btn');
		const isSelectionFull = currentSelection.length === CODE_LENGTH;

		buttons.forEach(btn => {
			const color = btn.dataset.color;
			const isSelected = currentSelection.includes(color);
			
			if (isSelected || (isSelectionFull && !isSelected)) {
				btn.disabled = true;
				btn.style.opacity = '0.5';
			} else {
				btn.disabled = false;
				btn.style.opacity = '1';
			}
		});
	}

	function updatePaletteState() {
		const buttons = colorPalette.querySelectorAll('.color-btn');
		const isSelectionFull = currentSelection.length === CODE_LENGTH;

		buttons.forEach(btn => {
			const color = btn.dataset.color;
			const isSelected = currentSelection.includes(color);
			
			if (isSelected || (isSelectionFull && !isSelected)) {
				btn.disabled = true;
				btn.style.opacity = '0.5';
			} else {
				btn.disabled = false;
				btn.style.opacity = '1';
			}
		});
	}

	function renderCurrentSelection() {
		currentSelectionDiv.innerHTML = '';
		currentSelection.forEach(color => {
			currentSelectionDiv.appendChild(createPegDiv(color, 'peg'));
		});
	}

	function renderHistory() {
		historyListDiv.innerHTML = '';
		history.forEach(item => {
			const historyItemDiv = document.createElement('div');
			historyItemDiv.className = 'history-item';
			const pegsDiv = document.createElement('div');
			pegsDiv.className = 'history-pegs';
			item.guess.forEach(color => {
				pegsDiv.appendChild(createPegDiv(color, 'history-peg'));
			});
			const feedbackDiv = document.createElement('div');
			feedbackDiv.className = 'history-feedback';
			feedbackDiv.textContent = `H: ${item.hits}, B: ${item.blows}`;
			historyItemDiv.appendChild(pegsDiv);
			historyItemDiv.appendChild(feedbackDiv);
			historyListDiv.appendChild(historyItemDiv);
		});
	}

	function renderCandidates() {
		candidatesListUl.innerHTML = '';
		candidateCountSpan.textContent = currentCandidates.length;
		const probability = currentCandidates.length > 0 ? (1 / currentCandidates.length * 100).toFixed(2) : 0;
		
		// パフォーマンスのため、表示する候補を制限
		const displayLimit = 100;
		const candidatesToDisplay = currentCandidates.slice(0, displayLimit);

		candidatesToDisplay.forEach(candidate => {
			const candidateItemLi = document.createElement('li');
			candidateItemLi.className = 'candidate-item';
			const pegsDiv = document.createElement('div');
			pegsDiv.className = 'candidate-pegs';
			candidate.forEach(color => {
				pegsDiv.appendChild(createPegDiv(color, 'candidate-peg'));
			});
			const probSpan = document.createElement('span');
			probSpan.className = 'candidate-prob';
			probSpan.textContent = `${probability}%`;
			candidateItemLi.appendChild(pegsDiv);
			candidateItemLi.appendChild(probSpan);
			candidatesListUl.appendChild(candidateItemLi);
		});

		if (currentCandidates.length > displayLimit) {
			const moreItem = document.createElement('li');
			moreItem.textContent = `... and ${currentCandidates.length - displayLimit} more.`;
			moreItem.style.padding = '10px 0';
			candidatesListUl.appendChild(moreItem);
		}
	}

	function renderSuggestedGuess(guess) {
		suggestedGuessPegs.innerHTML = '';
		if (guess) {
			guess.forEach(color => {
				suggestedGuessPegs.appendChild(createPegDiv(color, 'history-peg'));
			});
			suggestionSection.style.display = 'block';
		}
	}

	// --- 開始 ---
	init();
});
