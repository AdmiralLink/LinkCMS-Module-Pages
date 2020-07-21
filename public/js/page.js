let Page = function() {
    let Slug = {
        checking: false,
        valid: false
    };
    let ErrorClass = 'b-3 b-solid b-color-warning';
    let Actions = {
        saving: false,
        type: false,
        afterCheck: function() {
            Data.draftModifiedDate = dayjs().unix();
            if (Actions.type == 'publish') {
                Data.publishedContent = Data.draftContent; 
                Data.publishedModifiedDate = Data.draftModifiedDate;
            }
            Actions.setStatus();
            Actions.localSave();
            Actions.sendData();
        },
        checkRequired: function() {
            let stop = false;
            if (Elements.title.value) {
                Elements.title.className = '';
                Elements.slug.className = '';
                if (!Elements.slug.value) {
                    Elements.slug.value = slugify(Elements.title.value);
                } else {
                    Elements.slug.value = slugify(Elements.slug.value);
                }
                Actions.checkSlug();
            } else {
                Elements.title.className = ErrorClass;
                stop = true;
                if (!Elements.slug.value) {
                    Elements.slug.className = ErrorClass;
                } else {
                    Elements.slug.value = slugify(Elements.slug.value);
                    Actions.checkSlug();
                }
            }
            if (Actions.type == 'publish') {
                if (!Elements.pubDate.value) {
                    Elements.pubDate.value = dayjs().format('MMM. DD YYYY h:mm a');
                    Data.pubDate = dayjs().unix();
                } else {
                    Data.pubDate = dayjs(new Date(Elements.pubDate.value)).unix();
                }
            }
            return !stop;
        },
        checkSlug: function() {
            let slug = Elements.slug.value;
            if (!slug) {
                Slug.valid = false;
                Elements.slug.className = ErrorClass;
                Elements.slugAlert.innerText = 'Missing slug';
            }
            let ajax = new Ajax('/api/content/slugTaken/' + slug + '/' + Data.id, false, false, 'GET');
            Slug.checking = true;
            let checkSuccess = ajax.addEventListener('success', function(e) {
                ajax.removeEventListener('success', checkSuccess);
                if (ajax.getAttribute('content') == 'true') {
                    Slug.valid = false;
                    Elements.slug.className = ErrorClass;
                    Elements.slugAlert.innerText = 'The slug "' + Elements.slug.value + '" is already in use on this site. Please try another.';
                } else {
                    Elements.slug.className = '';
                    Data.slug = Elements.slug.value;
                    Slug.valid = true;
                }
                Slug.checking = false;
                document.body.dispatchEvent(new Event('Slug checked'));
            });
            let checkFailure = ajax.addEventListener('failure', function(e) {
                ajax.removeEventListener('failure', checkFailure);
                Slug.checking = false;
                document.body.dispatchEvent(new Event('Slug checked'));
            });
        },
        getContent: function() {
            Data.draftContent = Editor.getContents();
            Data.title = Elements.title.value;
            Data.slug = Elements.slug.value;
        },
        getElements: function() {
            ['pubDate', 'slug', 'title', 'slugAlert'].forEach(function(elId) {
                Elements[elId] = document.getElementById(elId);
            });
        },
        import: function(data) {
            let skip = ['id', 'status', 'draftContent', 'draftModifiedDate', 'publishedContent', 'publishedModifiedDate'];
            for (let [key,value] of Object.entries(data)) {
                if (key == 'type' || !value)
                    continue;
                Data[key] = value;
                if (skip.indexOf(key) > -1)
                    continue;
                if (key == 'pubDate') {
                    value = dayjs(new Date(value * 1000)).format('MMM. DD YYYY h:mm a');
                }
                Elements[key].value = value;
            };            
        },
        init: function() {
            Actions.getElements();
            Controls.addEvents();
        },
        localSave: function() {
            
        },
        save: function(type) {
            Actions.type = type;
            Actions.getContent()
            if (Actions.checkRequired()) {
                if (!Slug.checking) {
                    Actions.afterCheck();
                } else {
                    let Listener = document.body.addEventListener('Slug checked', function() {
                        document.body.removeEventListener('Slug checked', Listener);
                        if (Slug.valid) {
                            Actions.afterCheck();
                        }
                    });
                }
            }
        },
        receiveData: function(evt, type, ajax, modal) {
            Actions.saving = false;
            if (type == 'success') {
                if (ajax.response.content.type == 'insert') {
                    window.location.href = '/manage/pages/edit/' + ajax.response.content.id;
                } else {
                    Controls.set();
                    modal.text.innerText = 'Page saved';
                    modal.notification.innerText = 'Page saved successfully. Hit escape to close the modal';
                    let icon = modal.modalContent.querySelectorAll('svg')[0].classList;
                    icon.remove('fa-hourglass');
                    icon.add('fa-check-circle');
                    icon.remove('fa-spin');
                    icon.add('t-color-success')
                    modal.addConfirmButton();
                    modal.addCloseX();
                    modal.confirmBtn.focus();
                }
            } else {
                modal.close();
            }
        },
        revertContent: function() {
            Data.draftContent = Data.publishedContent;
            Editor.removeAllBlocks(Data.draftContent);
        },
        sendData: function() {
            if (Actions.saving) {
                return false;
            }
            Actions.saving = true;
            let modal = new WorkingModal('Saving, please wait ...');
            var ajaxSend = new Ajax('/api/pages/save', Data, false, 'POST', true);
            ajaxSend.eventEl.addEventListener('success', Actions.receiveData.bind(null, event, 'success', ajaxSend, modal));
            ajaxSend.eventEl.addEventListener('failure', Actions.receiveData.bind(null, event, 'success', ajaxSend, modal));
        },
        setStatus: function() {
            if (Actions.type == 'publish' || Data.publishedModifiedDate) {
                if (Data.pubDate <= dayjs().unix()) {
                    Data.status = 'published';
                } else {
                    Data.status = 'scheduled';
                }
            } else {
                Data.status = 'draft';
            }
        }
    };
    let Buttons = {
        datePicker: document.getElementById('datePicker'),
        revert: document.getElementById('revertBtn'),
        draft: document.getElementById('draftBtn'),
        preview: document.getElementById('previewBtn'),
        publish: document.getElementById('publishBtn'),
        view: document.getElementById('viewBtn'),
        review: document.getElementById('reviewBtn'),
    };
    let Controls = {
        addEvents: function() {
            Buttons.datePicker.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                let modal = new DatePickerModal(Data.pubDate);
                modal.modalContainer.addEventListener('confirmed', function(e) {
                    Elements.pubDate.value = modal.picker.time.string;
                    Elements.pubDate.focus();
                    Data.pubDate = modal.picker.time.timestamp;
                });
                modal.modalContainer.addEventListener('canceled', function(e) {
                    Elements.pubDate.focus();
                });
            });
            Buttons.revert.addEventListener('click', function(e) {
                e.preventDefault();
                let modal = new MiniModal({
                    confirm: true,
                    content: 'This will replace your content with the currently published content. All changes will be lost. Are you sure you want to do this?'
                });
                modal.addEventListener('confirmed', function(e) {
                    Actions.revertContent();
                });
            });
            Buttons.draft.addEventListener('click', function(e) {
                e.preventDefault();
                Actions.save('draft');
            });
            Buttons.preview.addEventListener('click', function(e) {
                e.preventDefault();
                Buttons.draft.click();
                window.open(window.location.href.replace('edit', 'preview'), '_blank');
            });
            Buttons.publish.addEventListener('click', function(e) {
                e.preventDefault();
                Actions.save('publish');
            });
            Buttons.view.addEventListener('click', function(e) {
                e.preventDefault();
                window.open(window.linkcms.url + '/' + Data.slug, '_blank');
            });
            Buttons.review.addEventListener('click', function(e) {
                e.preventDefault();
            });
        },
        set: function(state) {
            let disabled = [];
            switch(state) {
                case 'insert':
                    disabled = ['revert', 'view', 'review'];
                    break;
                case 'edit':
                    if (Data.status == 'draft') {
                        disabled = ['revert', 'view', 'review'];
                    } else {
                        disabled = [];
                    }
                    break;
            }
            for (let [key,value] of Object.entries(Buttons)) {
                if (disabled.indexOf(key) > -1) {
                    value.setAttribute('disabled', true);
                } else {
                    value.removeAttribute('disabled');
                }
            }
        }
    };
    let Data = {
        id: null,
        title: null,
        slug: null,
        status: null,
        pubDate: null,
        draftModifiedDate: null,
        draftContent: null,
        publishedModifiedDate: null,
        publishedContent: null
    };
    let Editor = false;
    let Elements = {};
    let Interface = {
        start: function(data) {
            Actions.init();
            if (data) {
                Actions.import(data);
                data = Data.draftContent;
                Controls.set('edit');
            } else {
                Controls.set('insert');
            }
            Editor = Hat.start({imageUploadUrl: '/api/image/upload', data: data});
            window.data = Data;
        }
    };
    return Interface;
}();