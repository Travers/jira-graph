(function() {
    function statusToRGB(s) {
        if (s == 'Backlog') {
            return '#66cc33';
        }
        if (s == 'Ready For Dev') {
            return '#e7ff33';
        }
        if (s == 'In Progress') {
            return '#00ff00';
        }
        if (s == 'In QA on feature branch') {
            return '#750099';
        }
        if (s == 'In Code Review') {
            return '#009999';
        }
        if (s == 'Resolved, on staging') {
            return '#ff69b4';
        }
        if (s == 'Closed') {
            return '#eeeeee';
        }
        return '#000000';
    }

    function renderGraph(data) {
        var issues = data.issues.map(function(elem) {
            return {
                data: Object.assign({
                    id: elem.key
                }, elem)
            }
        });

        var issueEdges = [];
        for (var i = 0; i < issues.length; i++) {
            var blockingIssue = issues[i].data.id;
            var blockedIssues = data.graph[blockingIssue];
            for (var j = 0; j < blockedIssues.length; j++) {
                var id = blockingIssue + '_blocks_' + blockedIssues[j];
                issueEdges.push({
                    data: {
                        id: id,
                        source: blockingIssue,
                        target: blockedIssues[j]
                    }
                });
            }
        }

        var cy = cytoscape({
            container: document.getElementById('cy'),

            boxSelectionEnabled: false,
            autounselectify: true,

            layout: {
                name: 'dagre',
                directed: true
            },

            style: [{
                    selector: 'node',
                    style: {
                        'content': 'data(id)',
                        'text-opacity': 0.8,
                        'text-valign': 'center',
                        'color': 'white',
                        'text-outline-width': 2,
                        'text-outline-color': '#11479e',
                        'background-color': function(ele) {
                            return statusToRGB(ele.data('status'))
                        }
                    }
                },

                {
                    selector: 'edge',
                    style: {
                        'curve-style': 'bezier',
                        'width': 4,
                        'target-arrow-shape': 'triangle',
                        'line-color': '#9dbaea',
                        'target-arrow-color': '#9dbaea'
                    }
                }
            ],

            elements: {
                nodes: issues,
                edges: issueEdges,
            },
        });

        cy.on('tap', 'node', function() {
            var key = this.data('id');
            window.location.href = 'https://clypdinc.atlassian.net/browse/' + key;
        });

    }

    window.onload = function() {
        var pathparts = window.location.pathname.split('/');
        var epicKey = pathparts[pathparts.length - 1];
        console.log('loading ' + epicKey);

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var resp = JSON.parse(this.responseText);
                renderGraph(resp);
                console.log('loaded ' + epicKey);
            }
        }
        xhr.open('GET', '/api/epics/' + epicKey, true);
        xhr.send();
    }
})();