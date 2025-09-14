
const mapping = fetch('../assets/json/mapping.json');
const blogFile = fetch('../assets/json/blog-data.json');
Promise.all([mapping, blogFile])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(([mappingData, blogData]) => {
        blogData.reverse();
        const tagsReverse = {};
        for (const [jp, eng] of Object.entries(mappingData)) {
            tagsReverse[eng] = jp;
        }
        const params = new URLSearchParams(location.search);
        const queryTags = params.getAll('tag');
        queryTags.forEach(queryTag => {
            if (tagsReverse[queryTag] == undefined) return;
            const hashtagElement = document.createElement('span');
            hashtagElement.className = 'hashtag';
            hashtagElement.dataset.hashtag = queryTag;
            hashtagElement.textContent = '# ' + tagsReverse[queryTag];
            const deleteElement = document.createElement('span');
            deleteElement.className = 'delete';
            deleteElement.dataset.hashtag = queryTag;
            deleteElement.innerHTML = '&times;';
            deleteElement.addEventListener('click', () => {
                const newQueryTags = queryTags.filter(tag => tag != queryTag);
                if (newQueryTags.length == 0) {
                    window.location.href = './search.html';
                } else {
                    const newSearchURL = '?tag=' + newQueryTags.join('&tag=');
                    window.location.search = newSearchURL;
                }
            });
            hashtagElement.appendChild(deleteElement);
            document.getElementsByClassName('hashtags')[0].appendChild(hashtagElement);
        });
        const filteredBlog = blogData.filter(blog => {
            return queryTags.every(queryTag => blog.tags.includes(tagsReverse[queryTag]));
        });
        filteredBlog.forEach(recBlog => {
            const recElement = document.createElement('div');
            recElement.className = 'blog';
            recElement.innerHTML = `
                <div class="content">
                    <h3 class="blog-title">${recBlog.title}</h3>
                    <div class="tags"></div>
                    <p class="summary">${recBlog.summary}</p>
                    <p class="date">
                        <img src="../assets/images/calendar.svg" alt="最終更新日: " class="svg-icon"><span>${recBlog.date}</span>
                        <img src="../assets/images/clock.svg" alt="所要時間: " class="svg-icon" style="margin-left: 15px;"><span>${recBlog.readTime}</span>
                    </p>
                </div>
                <picture>
                    <img src="${recBlog.thumbnail}" alt="ブログのサムネイル" class="thumbnail">
                </picture>
            `;
                                    
            const tags = recElement.getElementsByClassName('tags')[0];
            recBlog.tags.forEach(tagData => {
                const tag = document.createElement('span');
                tag.className = 'tag';
                tag.textContent = `# ${tagData}`;
                tag.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (queryTags.length == 0) {
                        window.location.search += `?tag=${mappingData[tagData]}`;
                    } else if (queryTags.includes(mappingData[tagData])) {
                        window.location.reload();
                    } else {
                        window.location.search += `&tag=${mappingData[tagData]}`;
                    }
                });
                tags.appendChild(tag);
            });
            recElement.addEventListener('click', () => {
                window.location.href = recBlog.id + '.html';
            });
            document.getElementsByClassName('blog-list')[0].appendChild(recElement);
        });
    }).catch(error => {
        console.error('Error loading blog data:', error);
    });