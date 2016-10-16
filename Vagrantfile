Vagrant.configure(2) do |config|

    config.vm.box = "ubuntu/xenial64" 
    config.ssh.insert_key = true

    config.vm.provider "virtualbox" do |v|
      v.memory = 2000
      v.cpus = 1
    end

    config.vm.network :forwarded_port, host: 8015, guest: 80 # Apache
    config.vm.network :forwarded_port, host: 3005, guest: 9200 # ElasticSearch

    config.vm.provision "ansible_local" do |ansible|
        ansible.playbook = "provision/rolesplaybook.yaml"        
    end

    config.vm.provision "ansible_local" do |ansible|
        ansible.playbook = "provision/playbook.yaml"        
    end

end